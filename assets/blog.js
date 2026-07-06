// assets/blog.js — reading progress + auto TOC. No-op if elements absent.
(function () {
  var bar = document.querySelector('.progress-bar');
  if (bar) {
    window.addEventListener('scroll', function () {
      var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (h.scrollTop / max * 100) : 0) + '%';
    }, { passive: true });
  }
  var toc = document.querySelector('.toc ul');
  if (toc) {
    var hs = document.querySelectorAll('.article h2');
    hs.forEach(function (h, i) {
      if (!h.id) h.id = 's' + i;
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      li.appendChild(a);
      toc.appendChild(li);
    });
    if (!hs.length) { var box = toc.closest('.toc'); if (box) box.style.display = 'none'; }
  }
})();
