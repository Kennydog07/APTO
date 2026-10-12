/* Theme behaviour: mobile menu, variant selection, AJAX add-to-basket,
   quantity steppers, gallery thumbnails, sort select, recommendations.
   Progressive enhancement: everything works without JavaScript. */
(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');

  // Mobile menu
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.getElementById('MobileMenu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      menu.hidden = open;
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { toggle.click(); toggle.focus(); }
    });
  }

  // Collection sort
  var sort = document.querySelector('[data-sort]');
  if (sort) sort.addEventListener('change', function () { sort.form.submit(); });

  // Product section
  var section = document.querySelector('[data-product-section]');
  if (section) {
    var dataEl = (section.closest('section') || document).querySelector('[data-product-json]');
    var data = dataEl ? JSON.parse(dataEl.textContent) : { variants: [], strings: {} };
    var form = section.querySelector('[data-product-form]');
    var idInput = section.querySelector('[data-variant-id]');
    var priceWrap = section.querySelector('[data-price-wrapper]');
    var stock = section.querySelector('[data-stock]');
    var addBtn = section.querySelector('[data-add-button]');
    var errorEl = section.querySelector('[data-form-error]');
    var addedEl = section.querySelector('[data-added]');
    var mainImage = section.querySelector('[data-main-image] img');

    function selectedOptions() {
      var out = [];
      section.querySelectorAll('input[data-option-index]:checked').forEach(function (i) { out[Number(i.dataset.optionIndex)] = i.value; });
      return out;
    }
    function findVariant(opts) {
      return data.variants.find(function (v) { return v.options.every(function (o, i) { return o === opts[i]; }); });
    }
    function markUnavailable() {
      var opts = selectedOptions();
      section.querySelectorAll('input[data-option-index]').forEach(function (input) {
        var idx = Number(input.dataset.optionIndex);
        var test = opts.slice(); test[idx] = input.value;
        var v = findVariant(test);
        var label = section.querySelector('label[for="' + input.id + '"]');
        if (label) label.classList.toggle('is-unavailable', !v || !v.available);
      });
    }
    function update() {
      var v = findVariant(selectedOptions());
      var s = data.strings;
      if (!v) {
        addBtn.disabled = true; addBtn.textContent = s.unavailable; stock.textContent = s.unavailable; stock.className = 'stock stock--out';
        return;
      }
      idInput.value = v.id;
      priceWrap.innerHTML = '<div class="price price--large">' + v.price + (v.compare ? ' <s class="price__compare">' + v.compare + '</s>' : '') + '<span class="price__note">' + s.vat + '</span></div>';
      addBtn.disabled = !v.available;
      addBtn.textContent = v.available ? s.add : s.soldOut;
      stock.className = 'stock' + (v.available ? (v.low ? ' stock--low' : '') : ' stock--out');
      stock.textContent = v.available ? (v.low ? s.low.replace('__n__', v.low) : s.inStock) : s.soldOut;
      if (v.image && mainImage) { mainImage.src = v.image; mainImage.removeAttribute('srcset'); }
      var url = new URL(window.location.href);
      url.searchParams.set('variant', v.id);
      window.history.replaceState({}, '', url.toString());
      markUnavailable();
    }
    section.querySelectorAll('input[data-option-index]').forEach(function (i) { i.addEventListener('change', update); });
    markUnavailable();

    // Quantity steppers
    section.querySelectorAll('[data-qty]').forEach(function (b) {
      b.addEventListener('click', function () {
        var input = b.parentElement.querySelector('input');
        var n = Math.min(Number(input.max) || 99, Math.max(1, (Number(input.value) || 1) + Number(b.dataset.qty)));
        input.value = n;
      });
    });

    // Gallery thumbnails
    section.querySelectorAll('[data-thumb]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!mainImage) return;
        mainImage.src = btn.dataset.src; mainImage.removeAttribute('srcset'); mainImage.alt = btn.dataset.alt;
        section.querySelectorAll('[data-thumb]').forEach(function (t) { t.removeAttribute('aria-current'); });
        btn.setAttribute('aria-current', 'true');
      });
    });

    // AJAX add to basket (falls back to normal form post on error)
    if (form && window.fetch) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        errorEl.hidden = true; addedEl.hidden = true; addBtn.disabled = true;
        fetch((window.Shopify && window.Shopify.routes ? window.Shopify.routes.root : '/') + 'cart/add.js', {
          method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ items: [{ id: Number(idInput.value), quantity: Number(form.querySelector('[name=quantity]').value) || 1 }] })
        }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
          .then(function (res) {
            if (!res.ok) { errorEl.textContent = res.body.description || res.body.message || 'Could not add to basket'; errorEl.hidden = false; return; }
            addedEl.hidden = false;
            return fetch('/cart.js').then(function (r) { return r.json(); }).then(function (cart) {
              document.querySelectorAll('[data-cart-count]').forEach(function (c) { c.textContent = cart.item_count || ''; });
              var live = document.getElementById('CartLive'); if (live) live.textContent = addedEl.textContent;
            });
          })
          .catch(function () { form.submit(); })
          .finally(function () { var v = findVariant(selectedOptions()); addBtn.disabled = !(v ? v.available : true); });
      });
    }
  }

  // Product recommendations (loaded after page render)
  var rec = document.querySelector('[data-recommendations]');
  if (rec && rec.dataset.url && window.fetch && !rec.querySelector('.grid')) {
    fetch(rec.dataset.url).then(function (r) { return r.text(); }).then(function (html) {
      var tmp = document.createElement('div'); tmp.innerHTML = html;
      var inner = tmp.querySelector('[data-recommendations]');
      if (inner && inner.innerHTML.trim()) rec.innerHTML = inner.innerHTML;
    }).catch(function () {});
  }
})();
