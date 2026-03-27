(function () {
  'use strict';

  var user = typeof window.GITHUB_USER === 'string' ? window.GITHUB_USER.trim() : '';
  var listEl = document.getElementById('repo-list');
  if (!listEl) return;

  if (!user || user === 'YOUR_GITHUB_USERNAME') {
    listEl.innerHTML = '<li class="repo-error">请在 index.html 中设置正确的 <code>window.GITHUB_USER</code>。</li>';
    return;
  }

  var url = 'https://api.github.com/users/' + encodeURIComponent(user) + '/repos?sort=pushed&per_page=8';

  fetch(url, { headers: { Accept: 'application/vnd.github+json' } })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (repos) {
      if (!Array.isArray(repos) || repos.length === 0) {
        listEl.innerHTML = '<li class="repo-error">暂无公开仓库，或用户名有误。</li>';
        return;
      }

      var sorted = repos
        .filter(function (repo) { return !repo.fork; })
        .sort(function (a, b) { return new Date(b.pushed_at) - new Date(a.pushed_at); })
        .slice(0, 6);

      listEl.innerHTML = sorted.map(function (repo) {
        var desc = repo.description ? '<p class="repo-desc">' + escapeHtml(repo.description) + '</p>' : '';
        var language = repo.language ? '<span>' + escapeHtml(repo.language) + '</span>' : '';
        var stars = '<span>★ ' + Number(repo.stargazers_count || 0) + '</span>';
        var updated = '<span>Updated ' + formatDate(repo.pushed_at) + '</span>';
        var meta = '<div class="repo-meta">' + language + stars + updated + '</div>';

        return (
          '<li>' +
            '<a href="' + escapeAttr(repo.html_url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(repo.name) + '</a>' +
            desc +
            meta +
          '</li>'
        );
      }).join('');
    })
    .catch(function () {
      listEl.innerHTML = '<li class="repo-error">仓库加载失败（网络或 GitHub API 限流），请稍后重试。</li>';
    });

  function formatDate(iso) {
    if (!iso) return 'unknown';
    var date = new Date(iso);
    if (Number.isNaN(date.getTime())) return 'unknown';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function escapeHtml(s) {
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function escapeAttr(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
})();
