// assets/newsletter.js — makes the no-backend newsletter fallback actually work.
// When MailerLite is connected, the embed replaces the .js-subscribe form and this is a no-op.
(function () {
  function buildMailto(email) {
    var subject = encodeURIComponent('Subscribe to app news');
    var body = encodeURIComponent('Please subscribe this address to PurposeLab Studio app news: ' + email);
    return 'mailto:purposelab.studio@gmail.com?subject=' + subject + '&body=' + body;
  }
  // Exposed for testing.
  window.__buildSubscribeMailto = buildMailto;

  var forms = document.querySelectorAll('form.js-subscribe');
  forms.forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = f.querySelector('input[type="email"]');
      var email = input && input.value ? input.value.trim() : '';
      if (!email) { if (input) input.focus(); return; }
      window.location.href = buildMailto(email);
    });
  });
})();
