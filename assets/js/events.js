(function () {
  'use strict';

  var user = typeof window.GITHUB_USER === 'string' ? window.GITHUB_USER.trim() : '';
  var listEl = document.getElementById('activity-list');
  if (!listEl) return;

  function t(key) {
    return (window.t && window.t(key)) || key;
  }

  function timeAgo(dateStr) {
    var d = new Date(dateStr);
    var now = new Date();
    var diff = (now - d) / 1000;
    var lang = window.currentLang || 'zh';
    if (diff < 60) return t('timeAgoJustNow');
    if (diff < 3600) {
      var n = Math.floor(diff / 60);
      return n === 1 ? t('timeAgoMin') : t('timeAgoMins').replace('%d', n);
    }
    if (diff < 86400) {
      var n = Math.floor(diff / 3600);
      return n === 1 ? t('timeAgoHour') : t('timeAgoHours').replace('%d', n);
    }
    if (diff < 2592000) {
      var n = Math.floor(diff / 86400);
      return n === 1 ? t('timeAgoDay') : t('timeAgoDays').replace('%d', n);
    }
    if (diff < 604800 * 4) {
      var n = Math.floor(diff / 604800);
      return n === 1 ? t('timeAgoWeek') : t('timeAgoWeeks').replace('%d', n);
    }
    if (diff < 31536000) {
      var n = Math.floor(diff / 2592000);
      return n === 1 ? t('timeAgoMonth') : t('timeAgoMonths').replace('%d', n);
    }
    var n = Math.floor(diff / 31536000);
    return n === 1 ? t('timeAgoYear') : t('timeAgoYears').replace('%d', n);
  }

  function escapeHtml(s) {
    if (!s) return '';
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

  function repoUrl(name) {
    return 'https://github.com/' + name;
  }

  if (!user || user === 'YOUR_GITHUB_USERNAME') {
    listEl.innerHTML = '<li class="activity-empty">' + t('activityEmpty') + '</li>';
    return;
  }

  var url = 'https://api.github.com/users/' + encodeURIComponent(user) + '/events?per_page=30';

  fetch(url, { headers: { Accept: 'application/vnd.github.v3+json' } })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (events) {
      if (!Array.isArray(events)) {
        listEl.innerHTML = '<li class="activity-error">' + t('activityError') + '</li>';
        return;
      }
      var items = [];
      var seen = {};
      for (var i = 0; i < events.length && items.length < 15; i++) {
        var ev = events[i];
        var repoName = ev.repo && ev.repo.name;
        if (!repoName) continue;
        var repoLink = repoUrl(repoName);
        var createdAt = ev.created_at;
        var label = '';
        var link = repoLink;
        var type = '';

        if (ev.type === 'PushEvent') {
          var payload = ev.payload || {};
          var count = payload.size != null ? payload.size : (payload.commits && payload.commits.length) || 0;
          var ref = (payload.ref || '').replace(/^refs\/heads\//, '') || 'main';
          if (count === 0) continue;
          label = count === 1
            ? t('eventPushed') + ' ' + escapeHtml(repoName) + ' @ ' + escapeHtml(ref)
            : t('eventPushedCommits').replace('%d', count) + ' ' + escapeHtml(repoName) + ' @ ' + escapeHtml(ref);
          var firstCommit = payload.commits && payload.commits[0];
          link = firstCommit && firstCommit.url ? firstCommit.url : repoLink + '/commits/' + ref;
          type = 'commit';
        } else if (ev.type === 'WatchEvent' && (ev.payload || {}).action === 'started') {
          label = t('eventStarred') + ' ' + escapeHtml(repoName);
          link = repoLink;
          type = 'star';
        } else if (ev.type === 'PullRequestEvent') {
          var pr = (ev.payload || {}).pull_request;
          if (!pr) continue;
          var action = (ev.payload || {}).action;
          var prTitle = pr.title || ('#' + (pr.number || ''));
          if (action === 'opened') label = t('eventPROpened') + ': ' + escapeHtml(prTitle);
          else if (action === 'closed' && pr.merged) label = t('eventPRMerged') + ': ' + escapeHtml(prTitle);
          else if (action === 'closed') label = t('eventPRClosed') + ': ' + escapeHtml(prTitle);
          else continue;
          link = pr.html_url || repoLink;
          type = 'pr';
        } else continue;

        var key = type + '-' + (link || repoName) + '-' + createdAt;
        if (seen[key]) continue;
        seen[key] = true;
        items.push({
          type: type,
          label: label,
          link: link,
          time: timeAgo(createdAt),
        });
      }

      if (items.length === 0) {
        listEl.innerHTML = '<li class="activity-empty">' + t('activityEmpty') + '</li>';
        return;
      }

      listEl.innerHTML = items.map(function (it) {
        var icon = it.type === 'commit' ? '↳' : it.type === 'star' ? '★' : '⊞';
        return (
          '<li class="activity-item activity-' + it.type + '">' +
          '<a href="' + escapeAttr(it.link) + '" target="_blank" rel="noopener">' +
          '<span class="activity-icon" aria-hidden="true">' + icon + '</span>' +
          '<span class="activity-label">' + it.label + '</span>' +
          '<span class="activity-time">' + escapeHtml(it.time) + '</span>' +
          '</a></li>'
        );
      }).join('');
    })
    .catch(function () {
      listEl.innerHTML = '<li class="activity-error">' + t('activityError') + '</li>';
    });
})();
