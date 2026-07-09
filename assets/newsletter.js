// assets/newsletter.js — connects the site-styled newsletter form to MailerLite
// without loading MailerLite's own markup/CSS (keeps our design). The email value
// is posted to MailerLite's form endpoint (fire-and-forget, no-cors) and an inline
// "thanks" replaces the form. Product-waitlist forms opt out via data-subject and
// keep the mailto fallback. No-JS users fall back to the <noscript> mailto link.
(function () {
  var ML_ACTION = 'https://assets.mailerlite.com/jsonp/2499229/forms/192498487000040910/subscribe';

  function buildMailto(email, subject, bodyLead) {
    var s = encodeURIComponent(subject || 'Subscribe to app news');
    var b = encodeURIComponent((bodyLead || 'Please subscribe this address to PurposeLab Studio app news: ') + email);
    return 'mailto:purposelab.studio@gmail.com?subject=' + s + '&body=' + b;
  }
  // Exposed for testing.
  window.__buildSubscribeMailto = buildMailto;

  function showThanks(f) {
    var wrap = f.closest('.newsletter') || f.parentNode;
    f.style.display = 'none';
    var ok = wrap.querySelector('.js-subscribe-ok');
    if (!ok) {
      ok = document.createElement('p');
      ok.className = 'js-subscribe-ok';
      ok.setAttribute('role', 'status');
      wrap.appendChild(ok);
    }
    ok.textContent = 'Thanks! Please check your inbox to confirm your subscription.';
  }

  var forms = document.querySelectorAll('form.js-subscribe');
  forms.forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = f.querySelector('input[type="email"]');
      var email = input && input.value ? input.value.trim() : '';
      if (!email) { if (input) input.focus(); return; }

      // Product-waitlist forms (data-subject) keep the mailto behaviour.
      if (f.dataset.subject) {
        window.location.href = buildMailto(email, f.dataset.subject, f.dataset.bodyLead);
        return;
      }

      // Newsletter forms → MailerLite. Fire-and-forget (no-cors): the subscription
      // is recorded server-side; we can't read the opaque response, so we show
      // an optimistic inline confirmation.
      var body = new URLSearchParams();
      body.set('fields[email]', email);
      body.set('ml-submit', '1');
      body.set('anticsrf', 'true');
      fetch(ML_ACTION, { method: 'POST', mode: 'no-cors', body: body }).catch(function () {});
      showThanks(f);
    });
  });
})();

