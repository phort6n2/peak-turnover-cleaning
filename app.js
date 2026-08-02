/* High Alpine Cleaning — shared behavior */
(function () {
  'use strict';

  var QUOTE_EMAIL = 'hello@highalpinecleaning.com';

  // Progressive enhancement: content is visible by default; only enable the
  // reveal animation once JS is running.
  document.documentElement.classList.add('js');

  // Footer year
  var yr = document.getElementById('yr');
  if (yr) { yr.textContent = new Date().getFullYear(); }

  // Header shadow on scroll
  var header = document.querySelector('header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Mobile nav toggle
  var tog = document.querySelector('.nav-tog');
  var mnav = document.getElementById('mnav');
  if (tog && mnav) {
    var setMenu = function (open) {
      mnav.classList.toggle('open', open);
      tog.setAttribute('aria-expanded', open ? 'true' : 'false');
      tog.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    tog.addEventListener('click', function () {
      setMenu(!mnav.classList.contains('open'));
    });
    mnav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        setMenu(false);
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mnav.classList.contains('open')) {
        setMenu(false);
        tog.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (mnav.classList.contains('open') && !mnav.contains(e.target) && !tog.contains(e.target)) {
        setMenu(false);
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900 && mnav.classList.contains('open')) { setMenu(false); }
    });
  }

  // Scroll reveal (skipped automatically under prefers-reduced-motion via CSS)
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // Quote forms submit to a same-origin Vercel function, which passes validated
  // lead and consent data to HighLevel without exposing the workflow webhook.
  function composeMessage(data) {
    var order = ['name', 'phone', 'email', 'address', 'bedrooms', 'bathrooms', 'turnovers', 'notes'];
    var seen = {}, lines = [];
    order.concat(Object.keys(data)).forEach(function (k) {
      if (seen[k] || !data[k]) { return; }
      seen[k] = 1;
      lines.push(k.charAt(0).toUpperCase() + k.slice(1) + ': ' + data[k]);
    });
    return lines.join('\n');
  }

  function setFormBusy(form, busy) {
    var button = form.querySelector('button[type="submit"]');
    if (!button) { return; }
    if (!button.dataset.label) { button.dataset.label = button.textContent; }
    button.disabled = busy;
    button.textContent = busy ? 'Sending…' : button.dataset.label;
  }

  function showFormError(card, message, details) {
    var error = card.querySelector('.form-error');
    if (error) {
      error.querySelector('[data-error-message]').textContent = message;
      error.style.display = 'block';
      error.focus();
    }
    var fb = card.querySelector('.form-fallback');
    if (fb && details) {
      var ta = fb.querySelector('textarea');
      if (ta) { ta.value = details; }
      fb.style.display = 'block';
    }
  }

  async function handleQuote(e) {
    e.preventDefault();
    var form = e.target;
    if (!form.reportValidity()) { return false; }

    var formData = new FormData(form);
    var data = Object.fromEntries(formData.entries());
    data.sms_consent = formData.get('sms_consent') === 'yes';
    data.page_url = window.location.href;
    data.referrer = document.referrer;
    var search = new URLSearchParams(window.location.search);
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (key) {
      data[key] = search.get(key) || '';
    });
    var body = composeMessage(data);
    var card = form.closest('.qc, .fc') || form.parentNode;
    var error = card.querySelector('.form-error');
    if (error) { error.style.display = 'none'; }
    var fallback = card.querySelector('.form-fallback');
    if (fallback) { fallback.style.display = 'none'; }
    setFormBusy(form, true);

    try {
      var response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      });
      var result = await response.json().catch(function () { return {}; });
      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'We could not send your request right now.');
      }

      var ok = card.querySelector('.form-ok');
      if (ok) {
        form.style.display = 'none';
        ok.style.display = 'block';
        if (ok.hasAttribute('tabindex')) { ok.focus(); }
      }
    } catch (err) {
      showFormError(
        card,
        err.message || 'We could not send your request right now.',
        'To: ' + QUOTE_EMAIL + '\nSubject: Turnover quote request\n\n' + body
      );
    } finally {
      setFormBusy(form, false);
    }
    return false;
  }

  var forms = document.querySelectorAll('form[data-quote]');
  forms.forEach(function (f) {
    var sms = f.querySelector('[name="sms_consent"]');
    var phone = f.querySelector('[name="phone"]');
    if (sms && phone) {
      var syncPhoneRequirement = function () {
        phone.required = sms.checked;
        phone.setCustomValidity(sms.checked && !phone.value.trim() ? 'Enter a phone number to opt in to text messages.' : '');
      };
      sms.addEventListener('change', syncPhoneRequirement);
      phone.addEventListener('input', syncPhoneRequirement);
      syncPhoneRequirement();
    }
    f.addEventListener('submit', handleQuote);
  });

  // Copy button in the fallback block
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var ta = btn.parentNode.querySelector('textarea');
      if (!ta) { return; }
      ta.select();
      var markCopied = function () {
        btn.textContent = 'Copied ✓';
        setTimeout(function () { btn.textContent = 'Copy details'; }, 2000);
      };
      try {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(ta.value).then(markCopied, function () { ta.focus(); });
        } else if (document.execCommand('copy')) {
          markCopied();
        }
      } catch (err) { ta.focus(); }
    });
  });
})();
