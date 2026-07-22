/* Peak Turnover Cleaning — shared behavior
   ------------------------------------------------------------------
   Contact details live in ONE place below — update phone/email here
   and in the HTML (search for "555-0100" / "hello@peakturnovercleaning").
*/
(function () {
  'use strict';

  var QUOTE_EMAIL = 'hello@peakturnovercleaning.com';

  // Current year in footer
  var yr = document.getElementById('yr');
  if (yr) { yr.textContent = new Date().getFullYear(); }

  // Quote forms -> open visitor's email pre-filled (mailto)
  function submitQuote(e) {
    e.preventDefault();
    var form = e.target;
    var data = Object.fromEntries(new FormData(form).entries());
    var lines = [];
    for (var k in data) {
      if (data[k]) {
        lines.push(k.charAt(0).toUpperCase() + k.slice(1) + ': ' + data[k]);
      }
    }
    var subject = 'New turnover quote request' + (data.name ? ' - ' + data.name : '');
    var body = lines.join(String.fromCharCode(10));
    window.location.href = 'mailto:' + QUOTE_EMAIL +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
    var btn = form.querySelector('button[type=submit]');
    if (btn) { btn.textContent = 'Opening your email…'; }
    return false;
  }

  var forms = document.querySelectorAll('form[data-quote]');
  for (var i = 0; i < forms.length; i++) {
    forms[i].addEventListener('submit', submitQuote);
  }
})();
