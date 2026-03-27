(function () {
  'use strict';

  var user = typeof window.GITHUB_USER === 'string' ? window.GITHUB_USER.trim() : '';
  var link = document.getElementById('github-profile-link');
  if (link && user && user !== 'YOUR_GITHUB_USERNAME') {
    link.href = 'https://github.com/' + user;
  }

  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a'));
  var sections = navLinks
    .map(function (linkEl) {
      var id = (linkEl.getAttribute('href') || '').replace('#', '');
      return document.getElementById(id);
    })
    .filter(Boolean);

  if (!sections.length || !navLinks.length) return;

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (linkEl) {
          var active = linkEl.getAttribute('href') === '#' + id;
          linkEl.style.color = active ? 'var(--accent)' : 'var(--muted)';
        });
      });
    },
    { rootMargin: '-35% 0px -50% 0px', threshold: [0.2, 0.45, 0.8] }
  );

  sections.forEach(function (section) {
    io.observe(section);
  });
})();
