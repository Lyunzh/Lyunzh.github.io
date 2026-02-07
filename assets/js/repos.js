(function () {
  'use strict';

  var user = typeof window.GITHUB_USER === 'string' ? window.GITHUB_USER.trim() : '';
  var listEl = document.getElementById('repo-list');
  if (!listEl) return;

  function msg(key) {
    return (window.t && window.t(key)) || key;
  }

  if (!user || user === 'YOUR_GITHUB_USERNAME') {
    listEl.innerHTML = '<li class="repo-error">' + msg('reposErrorConfig') + '</li>';
    return;
  }

  var url = 'https://api.github.com/users/' + encodeURIComponent(user) + '/repos?sort=updated&per_page=10';

  fetch(url, { headers: { Accept: 'application/vnd.github.v3+json' } })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (repos) {
      if (!Array.isArray(repos) || repos.length === 0) {
        listEl.innerHTML = '<li class="repo-error">' + msg('reposEmpty') + '</li>';
        return;
      }
      listEl.innerHTML = repos.map(function (r) {
        var desc = r.description ? '<p class="repo-desc">' + escapeHtml(r.description) + '</p>' : '';
        var lang = r.language ? '<span>' + escapeHtml(r.language) + '</span>' : '';
        var stars = r.stargazers_count != null ? '<span>★ ' + r.stargazers_count + '</span>' : '';
        var meta = (lang || stars) ? '<div class="repo-meta">' + lang + stars + '</div>' : '';
        return '<li><a href="' + escapeAttr(r.html_url) + '" target="_blank" rel="noopener">' + escapeHtml(r.name) + '</a>' + desc + meta + '</li>';
      }).join('');
    })
    .catch(function () {
      listEl.innerHTML = '<li class="repo-error">' + msg('reposErrorNetwork') + '</li>';
    });

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
