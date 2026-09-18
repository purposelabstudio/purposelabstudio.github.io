// assets/newsletter.js — connects the site-styled newsletter form to MailerLite
// without loading MailerLite's own markup/CSS (keeps our design). The email value
// is posted to MailerLite's form endpoint (no-cors) and an inline status replaces
// the form after the browser sends the request. Product-waitlist forms opt out via data-subject and
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

  function showStatus(f, message, isError) {
    var wrap = f.closest('.newsletter') || f.parentNode;
    var ok = wrap.querySelector('.js-subscribe-ok');
    if (!ok) {
      ok = document.createElement('p');
      ok.className = 'js-subscribe-ok';
      ok.setAttribute('role', 'status');
      wrap.appendChild(ok);
    }
    ok.textContent = message;
    if (isError) {
      ok.classList.add('is-error');
      f.style.display = '';
    } else {
      ok.classList.remove('is-error');
      f.style.display = 'none';
    }
  }

  function addEmailFallback(f, email) {
    var wrap = f.closest('.newsletter') || f.parentNode;
    var status = wrap.querySelector('.js-subscribe-ok');
    if (!status) return;
    var existing = wrap.querySelector('.js-subscribe-fallback');
    if (existing) existing.remove();
    var link = document.createElement('a');
    link.className = 'js-subscribe-fallback';
    link.href = buildMailto(email);
    link.textContent = 'Email PurposeLab to subscribe';
    status.appendChild(document.createTextNode(' '));
    status.appendChild(link);
  }

  function setSubmitting(f, submitting) {
    f.dataset.submitting = submitting ? 'true' : 'false';
    var button = f.querySelector('[type="submit"]');
    if (button) button.disabled = submitting;
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
      if (f.dataset.submitting === 'true') return;
      setSubmitting(f, true);

      // Newsletter forms → MailerLite. no-cors gives an opaque response, so the
      // browser can confirm only that the request was sent, not that MailerLite
      // accepted or processed the subscription.
      var body = new URLSearchParams();
      body.set('fields[email]', email);
      body.set('ml-submit', '1');
      body.set('anticsrf', 'true');
      fetch(ML_ACTION, { method: 'POST', mode: 'no-cors', body: body })
        .then(function () {
          showStatus(f, 'Request sent. Please check your inbox for a confirmation email.');
        })
        .catch(function () {
          setSubmitting(f, false);
          showStatus(f, 'The request could not be sent. Please try again or use the email fallback below.', true);
          addEmailFallback(f, email);
        });
    });
  });
})();
