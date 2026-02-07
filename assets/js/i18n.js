(function () {
  'use strict';

  var STORAGE_KEY = 'site-lang';
  var LANG_ZH = 'zh';
  var LANG_EN = 'en';

  var strings = {
    zh: {
      homeTitle: '你好，这是我的 GitHub',
      homeSubtitle: '软件工程 · 后端与 AI Agent',
      ctaResume: '查看简历',
      ctaProfile: 'GitHub 主页',
      sectionActivity: '最近动态',
      activityLoading: '正在加载动态…',
      activityError: '无法加载动态，请稍后重试。',
      activityEmpty: '暂无公开动态。',
      eventPushed: '推送到',
      eventPushedCommits: '推送 %d 个提交到',
      eventStarred: '收藏了仓库',
      eventPROpened: '提交了 PR',
      eventPRMerged: '合并了 PR',
      eventPRClosed: '关闭了 PR',
      timeAgoJustNow: '刚刚',
      timeAgoMin: '1 分钟前',
      timeAgoMins: '%d 分钟前',
      timeAgoHour: '1 小时前',
      timeAgoHours: '%d 小时前',
      timeAgoDay: '1 天前',
      timeAgoDays: '%d 天前',
      timeAgoWeek: '1 周前',
      timeAgoWeeks: '%d 周前',
      timeAgoMonth: '1 个月前',
      timeAgoMonths: '%d 个月前',
      timeAgoYear: '1 年前',
      timeAgoYears: '%d 年前',
      sectionRepos: '仓库列表',
      reposLoading: '正在加载仓库列表…',
      reposErrorConfig: '请在 index.html 中把 window.GITHUB_USER 改成你的 GitHub 用户名。',
      reposEmpty: '暂无公开仓库，或用户名有误。',
      reposErrorNetwork: '无法加载仓库列表（可能是网络或 GitHub API 限制）。请检查用户名或稍后重试。',
      footerHosted: '由 GitHub Pages 托管',
      backHome: '← 返回首页',
      resumeTitle: '简历',
      sectionEducation: '教育背景',
      sectionSkills: '核心技能',
      sectionInternship: '实习经历',
      sectionProject: '项目经历',
      eduDegree: '软件工程 本科 · 2022.09 - 2026.07',
      eduLink: '学校官网',
      skillLang: '语言基础：',
      skillLangDesc: '熟练 Java、JUC、JVM；Golang、Goroutine；Python 及性能优化',
      skillDb: '数据库：',
      skillDbDesc: '熟练 MySQL、Redis；慢查询与索引优化经验',
      skillAi: 'AI：',
      skillAiDesc: 'AI-Native；跟进 Agent 工程前沿；熟练使用 Cursor/OpenCode、Claude Code、Zed 等编码 Agent，能在生产环境交付可上线代码',
      pineWork: 'Pine AI — 主要工作',
      pineMonitor: '监控系统：开发监控模块，对接多 PaaS，通过 webhook 与 OpenTelemetry 实现 Agent 状态监控。',
      pineBus: '消息总线：设计并实现服务端分布式总线；通过管道总线整合模块，提升响应速度，支持 LLM/STT/TTS 细粒度交互；负责转写模块。',
      pineTest: 'AI 回归测试：设计 Agent 回归测试体系；用 Agent + 外部 LLM 模拟客服，多轮对话测试 AUTH、反欺诈等维度；编写 exec/eval 提示词。',
      projectPeople: 'People review',
      projectP1: '集群下解决 Session 共享；拦截器实现登录校验与权限刷新。',
      projectP2: '基于 Cache Aside 处理库表与缓存一致性。',
      projectP3: 'Redis 缓存高频数据减压；解决穿透、雪崩、击穿。',
      projectP4: 'Redis + Lua 做秒杀资格预检；乐观锁防超卖。',
      projectP5: '集群下用 Redis 分布式锁保证「一人一单」线程安全。',
      footerHome: '首页',
    },
    en: {
      homeTitle: "Hi, I'm on GitHub",
      homeSubtitle: 'Software Engineering · Backend & AI Agent',
      ctaResume: 'Resume',
      ctaProfile: 'GitHub Profile',
      sectionActivity: 'Recent Activity',
      activityLoading: 'Loading activity…',
      activityError: 'Could not load activity. Try again later.',
      activityEmpty: 'No public activity yet.',
      eventPushed: 'Pushed to',
      eventPushedCommits: 'Pushed %d commits to',
      eventStarred: 'Starred',
      eventPROpened: 'Opened PR',
      eventPRMerged: 'Merged PR',
      eventPRClosed: 'Closed PR',
      timeAgoJustNow: 'Just now',
      timeAgoMin: '1 min ago',
      timeAgoMins: '%d mins ago',
      timeAgoHour: '1 hour ago',
      timeAgoHours: '%d hours ago',
      timeAgoDay: '1 day ago',
      timeAgoDays: '%d days ago',
      timeAgoWeek: '1 week ago',
      timeAgoWeeks: '%d weeks ago',
      timeAgoMonth: '1 month ago',
      timeAgoMonths: '%d months ago',
      timeAgoYear: '1 year ago',
      timeAgoYears: '%d years ago',
      sectionRepos: 'Repositories',
      reposLoading: 'Loading repositories…',
      reposErrorConfig: 'Set window.GITHUB_USER in index.html to your GitHub username.',
      reposEmpty: 'No public repositories, or username is wrong.',
      reposErrorNetwork: 'Could not load repositories (network or API limit). Check username or try again later.',
      footerHosted: 'Hosted on GitHub Pages',
      backHome: '← Back to Home',
      resumeTitle: 'Resume',
      sectionEducation: 'Education',
      sectionSkills: 'Core Skills',
      sectionInternship: 'Internship Experience',
      sectionProject: 'Project Experience',
      eduDegree: 'Bachelor of Software Engineering · 2022.09 - 2026.07',
      eduLink: 'University',
      skillLang: 'Language fundamentals: ',
      skillLangDesc: 'Java, JUC, JVM; Golang, Goroutine; Python, performance optimization.',
      skillDb: 'Databases: ',
      skillDbDesc: 'MySQL, Redis; slow query and index tuning.',
      skillAi: 'AI: ',
      skillAiDesc: 'AI-Native; Agent engineering; Cursor/OpenCode, Claude Code, Zed; shippable code in production.',
      pineWork: 'Pine AI — Key work',
      pineMonitor: 'Monitoring: monitor module, PaaS integration, webhook + OpenTelemetry for agent status.',
      pineBus: 'Message bus: server-side distributed bus; pipeline bus for modules; LLM/STT/TTS; transcriber module.',
      pineTest: 'AI regression testing: agent regression system; agentic CSRs + LLMs; multi-turn AUTH/Fraud tests; exec/eval prompts.',
      projectPeople: 'People review',
      projectP1: 'Session sharing in cluster; interceptors for login and permission refresh.',
      projectP2: 'Cache Aside for DB–cache consistency.',
      projectP3: 'Redis for hot data; cache penetration, avalanche, breakdown.',
      projectP4: 'Redis + Lua seckill pre-check; optimistic lock.',
      projectP5: 'Redis distributed lock for one-order-per-user in cluster.',
      footerHome: 'Home',
    },
  };

  function getLang() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored === LANG_EN || stored === LANG_ZH) return stored;
    } catch (e) {}
    return LANG_ZH;
  }

  function setLang(lang) {
    if (lang !== LANG_ZH && lang !== LANG_EN) return;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    document.documentElement.setAttribute('data-lang', lang);
    window.currentLang = lang;
    applyTexts();
    updateSwitcher();
  }

  function t(key) {
    var lang = window.currentLang || getLang();
    var map = strings[lang] || strings.zh;
    return map[key] != null ? map[key] : key;
  }

  function applyTexts() {
    var lang = window.currentLang || getLang();
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var text = t(key);
      if (text) el.textContent = text;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      var text = t(key);
      if (text) el.innerHTML = text;
    });
  }

  function updateSwitcher() {
    var lang = window.currentLang || getLang();
    document.querySelectorAll('.lang-switcher a[data-lang]').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-lang') === lang);
    });
  }

  window.currentLang = getLang();
  window.t = t;
  window.setLang = setLang;
  document.documentElement.setAttribute('data-lang', window.currentLang);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      applyTexts();
      updateSwitcher();
    });
  } else {
    applyTexts();
    updateSwitcher();
  }
})();
