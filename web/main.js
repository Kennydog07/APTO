/* APTO – front-end behaviour (no libraries) */
(function () {
  'use strict';

  // PLACEHOLDER: the email address used when the form can't reach the server.
  // Keep this in sync with the mailto links in index.html.
  var FALLBACK_EMAIL = 'apto.tools@gmail.com';
  // Netlify Forms accepts a urlencoded POST to '/web/' that includes form-name.
  // The local Express server (server.js) handles the same request.
  var ENDPOINT = '/web/';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  // ---------- Year in footer ----------
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  // ---------- Header: shadow on scroll ----------
  var header = $('.site-header');
  var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Mobile nav ----------
  var toggle = $('.nav-toggle');
  var nav = $('#site-nav');
  function closeNav() { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
  toggle.addEventListener('click', function () {
    var open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', closeNav); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });

  // ---------- Reveal on scroll + active nav link ----------
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    $$('.reveal').forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + 'ms';
      io.observe(el);
    });

    var links = $$('.site-nav a[href^="#"]:not(.btn)');
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('href') === '#' + entry.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (l) { var s = $(l.getAttribute('href')); if (s) spy.observe(s); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
  }

  // ---------- FAQ: keep one open at a time ----------
  var faqs = $$('.faq details');
  faqs.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) faqs.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  // ---------- Pricing buttons pre-select the plan ----------
  var planSelect = $('#f-plan');
  $$('[data-plan]').forEach(function (btn) {
    btn.addEventListener('click', function () { if (planSelect) planSelect.value = btn.getAttribute('data-plan'); });
  });

  // ---------- Our work filter ----------
  var filterBtns = $$('.work-filter');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      filterBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      $$('#work-grid .work-card').forEach(function (card) {
        var show = f === 'all' || card.getAttribute('data-cat') === f;
        card.hidden = !show;
        if (show) card.classList.add('is-visible');
      });
    });
  });

  // ---------- Enquiry form ----------
  var form = $('#enquiry-form');
  if (!form) return;
  var statusBox = $('#form-status');
  var submitBtn = $('#submit-btn');
  var EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;
  var PHONE_RE = /^[0-9+()\-\s]{7,30}$/;

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }

  function showStatus(type, title, html) {
    var icons = { success: '🎉', error: '😕', info: '✉️' };
    statusBox.className = 'form-status is-' + type;
    statusBox.innerHTML = '<span class="fs-icon" aria-hidden="true">' + icons[type] + '</span><span><strong>' + title + '</strong>' + html + '</span>';
    statusBox.hidden = false;
    statusBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function setFieldErrors(errors) {
    $$('.field', form).forEach(function (f) { f.classList.remove('has-error'); });
    $$('[data-error-for]', form).forEach(function (p) { p.textContent = ''; });
    $$('input, select, textarea', form).forEach(function (el) { el.removeAttribute('aria-invalid'); });
    Object.keys(errors || {}).forEach(function (name) {
      var input = form.elements[name];
      var msg = $('[data-error-for="' + name + '"]', form);
      if (msg) { msg.textContent = errors[name]; msg.id = 'err-' + name; }
      if (input) {
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', 'err-' + name);
        input.closest('.field').classList.add('has-error');
      }
    });
    var first = Object.keys(errors || {})[0];
    if (first && form.elements[first]) form.elements[first].focus();
  }

  function collect() {
    var data = {};
    ['name', 'businessName', 'email', 'phone', 'businessType', 'planInterest', 'message', 'website'].forEach(function (k) {
      data[k] = (form.elements[k] && form.elements[k].value || '').trim();
    });
    return data;
  }

  function validate(d) {
    var e = {};
    if (!d.name) e.name = 'Please tell us your name.';
    if (!d.businessName) e.businessName = 'Please tell us your business name.';
    if (!d.email) e.email = 'Please add your email address.';
    else if (!EMAIL_RE.test(d.email)) e.email = 'That email address doesn’t look quite right.';
    if (d.phone && !PHONE_RE.test(d.phone)) e.phone = 'That phone number doesn’t look quite right.';
    if (!d.businessType) e.businessType = 'Please choose a business type.';
    if (!d.planInterest) e.planInterest = 'Please choose what you’re interested in.';
    if (d.message.length < 10) e.message = 'Please write a short message (at least 10 characters).';
    return e;
  }

  function optionText(name, value) {
    var opt = form.elements[name] && $('option[value="' + value + '"]', form.elements[name]);
    return opt ? opt.textContent : value;
  }

  function mailtoFallback(d) {
    var body = [
      'Name: ' + d.name,
      'Business: ' + d.businessName,
      'Email: ' + d.email,
      'Phone: ' + (d.phone || '-'),
      'Business type: ' + optionText('businessType', d.businessType),
      'Interested in: ' + optionText('planInterest', d.planInterest),
      '',
      d.message
    ].join('\n');
    return 'mailto:' + FALLBACK_EMAIL + '?subject=' + encodeURIComponent('Website enquiry: ' + d.businessName) + '&body=' + encodeURIComponent(body);
  }

  function showFallback(d) {
    showStatus('info', 'We couldn’t send that just now',
      ' Our enquiry system isn’t reachable from here, but nothing’s lost. <a href="' + escapeHtml(mailtoFallback(d)) + '">Send it by email instead</a> (your details are filled in for you), or email <a href="mailto:' + FALLBACK_EMAIL + '">' + FALLBACK_EMAIL + '</a>.');
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var d = collect();
    var errors = validate(d);
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      showStatus('error', 'Nearly there!', ' Please check the highlighted fields.');
      return;
    }

    // Opened straight from disk (file://): there's no server, go straight to the email fallback.
    if (location.protocol === 'file:' || !window.fetch) { showFallback(d); return; }

    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;
    $('.btn-label', submitBtn).textContent = 'Sending…';

    var body = new URLSearchParams(new FormData(form)).toString();

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json, text/html' },
      body: body
    })
      .then(function (res) {
        var type = res.headers.get('content-type') || '';
        if (type.indexOf('application/json') !== -1) {
          return res.json().then(function (json) { return { status: res.status, ok: res.ok, json: json }; }, function () { return { status: res.status, ok: res.ok, json: {} }; });
        }
        return { status: res.status, ok: res.ok, json: {} }; // Netlify Forms replies with HTML
      })
      .then(function (r) {
        if (r.ok && r.json.ok !== false) {
          form.reset();
          setFieldErrors({});
          showStatus('success', 'Thanks, ' + escapeHtml(d.name.split(' ')[0]) + '!', ' Your enquiry is on its way. We’ll get back to you at ' + escapeHtml(d.email) + '.');
        } else if (r.status === 400 && r.json.errors) {
          setFieldErrors(r.json.errors);
          showStatus('error', 'Nearly there!', ' ' + escapeHtml(r.json.message || 'Please check the highlighted fields.'));
        } else if (r.status === 429 && r.json.message) {
          showStatus('error', 'Please wait a moment', ' ' + escapeHtml(r.json.message));
        } else {
          showFallback(d);
        }
      })
      .catch(function () { showFallback(d); })
      .then(function () {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
        $('.btn-label', submitBtn).textContent = 'Send my enquiry';
      });
  });

  // Coming back from a no-JavaScript form post (server redirects with ?enquiry=sent|error)
  var params = new URLSearchParams(location.search);
  if (params.get('enquiry') === 'sent') showStatus('success', 'Thanks!', ' Your enquiry is on its way. We’ll be in touch soon.');
  if (params.get('enquiry') === 'error') showStatus('error', 'Something wasn’t quite right', ' Please check the form and try again.');
})();

// Make sure nothing stays hidden when printing.
window.addEventListener('beforeprint', function () {
  Array.prototype.forEach.call(document.querySelectorAll('.reveal'), function (el) { el.classList.add('is-visible'); });
});
