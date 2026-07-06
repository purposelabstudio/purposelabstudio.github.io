// assets/newsletter.js — makes the no-backend newsletter/waitlist fallback actually work.
// When MailerLite is connected, the embed replaces the .js-subscribe form and this is a no-op.
// A form may set data-subject and data-body-lead to customize the email (e.g. a product waitlist).
(function () {
  function buildMailto(email, subject, bodyLead) {
    var s = encodeURIComponent(subject || 'Subscribe to app news');
    var b = encodeURIComponent((bodyLead || 'Please subscribe this address to PurposeLab Studio app news: ') + email);
    return 'mailto:purposelab.studio@gmail.com?subject=' + s + '&body=' + b;
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
      window.location.href = buildMailto(email, f.dataset.subject, f.dataset.bodyLead);
    });
  });
})();
