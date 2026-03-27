# Homepage Long-Run Harness

这个目录实现了一个可持续循环迭代（loop iteration）的 **Planner → Generator → Evaluator** harness，参考 Anthropic《Harness design for long-running application development》的核心结构：

- 先由 Planner 将短需求扩展为可执行 spec。
- 每个 sprint 开始前，Generator 先产出「sprint contract」。
- 然后 Generator 实施代码，Evaluator 评分并给出 must-fix。
- 评分若低于阈值，自动把反馈回灌到下一次尝试。
- 所有交接都落地到文件（structured artifacts），便于长时运行与中断恢复。

## 文件说明

- `run_harness.py`: harness 主程序。
- `harness.config.example.json`: 示例配置（命令、阈值、迭代上限等）。
- `agents/*.md`: 三个 agent 的角色提示词模板。
- `runs/`: 每次运行的产物目录（自动创建）。

## 快速开始

```bash
# 1) 干跑（不调用外部 agent，只验证流程）
python harness/run_harness.py --dry-run --run-name smoke-test

# 2) 基于示例配置运行
python harness/run_harness.py --config harness/harness.config.example.json --dry-run
```

## 接入真实 Agent 的方法

配置文件里这三个字段是关键：

- `planner_command`
- `generator_command`
- `evaluator_command`
- `evaluator_grader`（建议把设计/功能评分标准写死在这里，确保 evaluator 严格一致）

要求：

1. 命令需要读取 `HARNESS_PROMPT`（环境变量）作为输入。
2. 命令需要把产物写到 `HARNESS_OUTPUT` 或 `{OUTPUT}` 指定路径。
3. evaluator 必须输出固定 JSON（含 `scores`、`must_fix`、`project_done`）。
4. 若你有明确 grader（例如 design_quality / originality / craft / functionality），请同步在 `thresholds` 与 `evaluator_grader` 中配置，harness 会将其注入 evaluator prompt。

> 建议：先保持 `--dry-run` 跑通，再替换成真实 agent 命令。

## 运行产物结构

每次运行都会生成 `harness/runs/run-YYYYmmdd-HHMMSS/`，包含：

- `meta.json`: 运行参数快照。
- `spec.md`: planner 产出的产品 spec。
- `sprint-XX/contract.md`: sprint 合同。
- `sprint-XX/implementation.md`: generator 实施说明。
- `sprint-XX/evaluation.json`: evaluator 评分结果。
- `sprint-XX/feedback-attempt-N.md`: 失败后自动反馈。
- `logs/*.log`: 每个 agent 调用日志。
