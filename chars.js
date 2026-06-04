// APTO Character Loader
// Resolves data-char="char-X" attributes to src paths
// Works with Netlify when PNGs are deployed alongside HTML files

(function () {
  function loadChars() {
    document.querySelectorAll('[data-char]').forEach(function (el) {
      var name = el.getAttribute('data-char');
      if (name && !el.src) {
        el.src = name + '.png';
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadChars);
  } else {
    loadChars();
  }
})();
