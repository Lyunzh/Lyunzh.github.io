#!/usr/bin/env python3
"""Long-running planner/generator/evaluator harness for this personal homepage repo.

Design inspired by Anthropic's harness article:
- Planner expands a short prompt to an executable product spec.
- Generator and evaluator iterate in sprints.
- Sprint contract is negotiated before implementation.
- Structured artifacts are passed via files.
- Threshold-based evaluation gates progress.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import shlex
import subprocess
import sys
import textwrap
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List

ROOT = Path(__file__).resolve().parents[1]
HARNESS_DIR = ROOT / "harness"
RUNS_DIR = HARNESS_DIR / "runs"


@dataclass
class HarnessConfig:
    task_prompt: str
    max_sprints: int
    max_retries_per_sprint: int
    thresholds: Dict[str, float]
    planner_command: str
    generator_command: str
    evaluator_command: str
    evaluator_grader: Dict[str, str]

    @staticmethod
    def from_file(path: Path) -> "HarnessConfig":
        raw = json.loads(path.read_text(encoding="utf-8"))
        return HarnessConfig(
            task_prompt=raw["task_prompt"],
            max_sprints=int(raw.get("max_sprints", 8)),
            max_retries_per_sprint=int(raw.get("max_retries_per_sprint", 2)),
            thresholds={k: float(v) for k, v in raw.get("thresholds", {}).items()},
            planner_command=str(raw.get("planner_command", "")).strip(),
            generator_command=str(raw.get("generator_command", "")).strip(),
            evaluator_command=str(raw.get("evaluator_command", "")).strip(),
            evaluator_grader={k: str(v) for k, v in raw.get("evaluator_grader", {}).items()},
        )


class HarnessError(RuntimeError):
    pass


class HarnessRunner:
    def __init__(self, config: HarnessConfig, dry_run: bool = False, run_name: str | None = None):
        self.config = config
        self.dry_run = dry_run
        stamp = dt.datetime.utcnow().strftime("%Y%m%d-%H%M%S")
        self.run_dir = RUNS_DIR / (run_name or f"run-{stamp}")
        self.artifacts = self.run_dir / "artifacts"
        self.logs = self.run_dir / "logs"

    def setup(self) -> None:
        self.artifacts.mkdir(parents=True, exist_ok=True)
        self.logs.mkdir(parents=True, exist_ok=True)
        (self.run_dir / "meta.json").write_text(
            json.dumps(
                {
                    "created_utc": dt.datetime.utcnow().isoformat() + "Z",
                    "task_prompt": self.config.task_prompt,
                    "max_sprints": self.config.max_sprints,
                    "max_retries_per_sprint": self.config.max_retries_per_sprint,
                    "thresholds": self.config.thresholds,
                    "evaluator_grader": self.config.evaluator_grader,
                    "dry_run": self.dry_run,
                },
                ensure_ascii=False,
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )

    def run(self) -> int:
        self.setup()
        print(f"[harness] run dir: {self.run_dir}")

        spec_file = self.run_dir / "spec.md"
        if not spec_file.exists():
            self._planner_stage(spec_file)

        for sprint in range(1, self.config.max_sprints + 1):
            print(f"\n[harness] === sprint {sprint}/{self.config.max_sprints} ===")
            sprint_dir = self.run_dir / f"sprint-{sprint:02d}"
            sprint_dir.mkdir(parents=True, exist_ok=True)

            contract_file = sprint_dir / "contract.md"
            impl_note_file = sprint_dir / "implementation.md"
            eval_file = sprint_dir / "evaluation.json"

            if not contract_file.exists():
                self._generator_stage("contract", sprint, contract_file)

            passed = False
            for attempt in range(1, self.config.max_retries_per_sprint + 2):
                print(f"[harness] sprint {sprint} attempt {attempt}")

                self._generator_stage("implement", sprint, impl_note_file)
                self._evaluator_stage(sprint, eval_file)

                result = json.loads(eval_file.read_text(encoding="utf-8"))
                missing_keys = [k for k in self.config.thresholds if k not in result.get("scores", {})]
                if missing_keys:
                    raise HarnessError(
                        f"sprint {sprint}: evaluator output missing required score keys: {missing_keys}"
                    )

                failed = {
                    k: (result["scores"][k], self.config.thresholds[k])
                    for k in self.config.thresholds
                    if float(result["scores"][k]) < self.config.thresholds[k]
                }

                if not failed:
                    passed = True
                    print(f"[harness] sprint {sprint} passed thresholds")
                    break

                if attempt > self.config.max_retries_per_sprint:
                    break

                feedback_file = sprint_dir / f"feedback-attempt-{attempt}.md"
                feedback = self._format_feedback(result, failed)
                feedback_file.write_text(feedback, encoding="utf-8")
                print(f"[harness] sprint {sprint} failed; feedback written: {feedback_file}")

            if not passed:
                print(f"[harness] stopping: sprint {sprint} did not meet thresholds")
                return 2

            if self._is_done(sprint_dir / "evaluation.json"):
                print("[harness] evaluator marked project done, exiting early")
                return 0

        print("[harness] reached max_sprints")
        return 0

    def _is_done(self, eval_path: Path) -> bool:
        try:
            data = json.loads(eval_path.read_text(encoding="utf-8"))
            return bool(data.get("project_done"))
        except Exception:
            return False

    def _planner_stage(self, spec_file: Path) -> None:
        prompt = textwrap.dedent(
            f"""
            You are PLANNER for this repository.
            User intent: {self.config.task_prompt}

            Create a concise but ambitious product spec for the personal homepage.
            Output markdown to: {spec_file}

            Include:
            1) Goals and non-goals
            2) Sprint plan (ordered)
            3) Acceptance criteria per sprint
            4) Risks and fallback plan
            """
        ).strip()
        self._run_stage("planner", self.config.planner_command, prompt, spec_file)

    def _generator_stage(self, mode: str, sprint: int, output_file: Path) -> None:
        prompt = textwrap.dedent(
            f"""
            You are GENERATOR for sprint {sprint} in this repository.
            Mode: {mode}
            Task prompt: {self.config.task_prompt}

            Read these artifacts first if they exist:
            - {self.run_dir / 'spec.md'}
            - {output_file.parent / 'contract.md'}
            - latest feedback-attempt-*.md under {output_file.parent}

            If mode=contract:
            - propose sprint scope + testable definition of done.

            If mode=implement:
            - implement code in the repository,
            - then summarize changes and checks in markdown.

            Write markdown output to: {output_file}
            """
        ).strip()
        self._run_stage("generator", self.config.generator_command, prompt, output_file)

    def _evaluator_stage(self, sprint: int, output_file: Path) -> None:
        keys = ", ".join(sorted(self.config.thresholds.keys()))
        grader_lines = "\n".join(
            [f"- {name}: {desc}" for name, desc in self.config.evaluator_grader.items()]
        ) or "- (no custom grader configured)"
        prompt = textwrap.dedent(
            f"""
            You are EVALUATOR for sprint {sprint}.
            Evaluate repository state and generator notes.
            The grader below is strict and must be enforced:
            {grader_lines}

            Required JSON format:
            {{
              "scores": {{ {', '.join([f'"{k}": <0-10>' for k in sorted(self.config.thresholds.keys())])} }},
              "summary": "short critique",
              "must_fix": ["..."],
              "project_done": true/false
            }}

            Required score keys: {keys}
            Write JSON to: {output_file}
            """
        ).strip()
        self._run_stage("evaluator", self.config.evaluator_command, prompt, output_file)

    def _run_stage(self, stage: str, command: str, prompt: str, output_file: Path) -> None:
        log_file = self.logs / f"{stage}-{dt.datetime.utcnow().strftime('%H%M%S')}.log"

        if self.dry_run:
            if output_file.suffix == ".json":
                mock = {
                    "scores": {k: max(v, 8.0) for k, v in self.config.thresholds.items()},
                    "summary": f"dry-run evaluator output for {stage}",
                    "must_fix": [],
                    "project_done": False,
                }
                output_file.write_text(json.dumps(mock, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            else:
                output_file.write_text(
                    f"# {stage} (dry-run)\n\nPrompt snippet:\n\n```\n{prompt[:500]}\n```\n",
                    encoding="utf-8",
                )
            log_file.write_text("dry-run\n", encoding="utf-8")
            return

        if not command:
            raise HarnessError(f"{stage}_command is empty. Use --dry-run or set command in config.")

        final_cmd = command.replace("{OUTPUT}", shlex.quote(str(output_file)))
        env = os.environ.copy()
        env["HARNESS_STAGE"] = stage
        env["HARNESS_RUN_DIR"] = str(self.run_dir)
        env["HARNESS_OUTPUT"] = str(output_file)
        env["HARNESS_PROMPT"] = prompt

        proc = subprocess.run(
            final_cmd,
            shell=True,
            cwd=str(ROOT),
            env=env,
            capture_output=True,
            text=True,
        )
        log = (
            f"$ {final_cmd}\n"
            f"exit={proc.returncode}\n"
            f"--- STDOUT ---\n{proc.stdout}\n"
            f"--- STDERR ---\n{proc.stderr}\n"
        )
        log_file.write_text(log, encoding="utf-8")

        if proc.returncode != 0:
            raise HarnessError(f"{stage} command failed with exit={proc.returncode}. log={log_file}")

        if not output_file.exists():
            raise HarnessError(f"{stage} did not create expected file: {output_file}")

    @staticmethod
    def _format_feedback(result: Dict, failed: Dict[str, tuple]) -> str:
        lines = ["# Evaluator feedback", "", result.get("summary", "(no summary)"), "", "## Failed thresholds"]
        for k, (actual, required) in failed.items():
            lines.append(f"- {k}: {actual} < {required}")
        must_fix = result.get("must_fix") or []
        if must_fix:
            lines.append("\n## Must fix")
            for item in must_fix:
                lines.append(f"- {item}")
        lines.append("")
        return "\n".join(lines)


def parse_args(argv: List[str]) -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Run planner/generator/evaluator harness")
    p.add_argument("--config", default=str(HARNESS_DIR / "harness.config.example.json"))
    p.add_argument("--dry-run", action="store_true", help="do not invoke external agent commands")
    p.add_argument("--run-name", default=None, help="custom run directory name")
    return p.parse_args(argv)


def main(argv: List[str]) -> int:
    args = parse_args(argv)
    config_path = Path(args.config)
    if not config_path.exists():
        print(f"config not found: {config_path}", file=sys.stderr)
        return 1

    config = HarnessConfig.from_file(config_path)
    runner = HarnessRunner(config=config, dry_run=args.dry_run, run_name=args.run_name)
    try:
        return runner.run()
    except HarnessError as exc:
        print(f"[harness][error] {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
