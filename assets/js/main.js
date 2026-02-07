(function () {
  'use strict';

  // 根据 GITHUB_USER 更新首页的 GitHub 个人主页链接
  var link = document.getElementById('github-profile-link');
  if (link && typeof window.GITHUB_USER === 'string' && window.GITHUB_USER && window.GITHUB_USER !== 'YOUR_GITHUB_USERNAME') {
    link.href = 'https://github.com/' + window.GITHUB_USER;
  }
})();
