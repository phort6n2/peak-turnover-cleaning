/* High Alpine Cleaning — shared behavior
   ------------------------------------------------------------------
   Update the quote destination in QUOTE_EMAIL and the matching HTML links.
*/
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

  // Quote forms -> compose email (mailto) with a visible fallback + success state
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

  function handleQuote(e) {
    e.preventDefault();
    var form = e.target;
    var data = Object.fromEntries(new FormData(form).entries());
    var body = composeMessage(data);
    var subject = 'New turnover quote request' + (data.name ? ' - ' + data.name : '');
    var href = 'mailto:' + QUOTE_EMAIL +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);

    // Try to open the visitor's email app
    window.location.href = href;

    var card = form.closest('.qc, .fc') || form.parentNode;

    // Replace the form with a clear next-step state. The messages are siblings
    // of the form so they remain visible after the fields are hidden.
    var ok = card.querySelector('.form-ok');
    if (ok) {
      form.style.display = 'none';
      ok.style.display = 'block';
      if (ok.hasAttribute('tabindex')) { ok.focus(); }
    }

    // Always reveal a copy/paste fallback for anyone whose mail app didn't open.
    var fb = card.querySelector('.form-fallback');
    if (fb) {
      var ta = fb.querySelector('textarea');
      if (ta) { ta.value = 'To: ' + QUOTE_EMAIL + '\nSubject: ' + subject + '\n\n' + body; }
      fb.style.display = 'block';
    }
    return false;
  }

  var forms = document.querySelectorAll('form[data-quote]');
  forms.forEach(function (f) { f.addEventListener('submit', handleQuote); });

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
