/* "Best pubs, bars & restaurants" add-on: filter chips. The cards are plain HTML, so the section works without this script. */
(function () {
  "use strict";
  var root = document.getElementById("picks");
  if (!root) return;
  var chips = root.querySelectorAll(".pk-chips .chip");
  var cards = root.querySelectorAll(".pk-card");
  for (var i = 0; i < chips.length; i++) {
    chips[i].addEventListener("click", function () {
      var t = this.getAttribute("data-type");
      for (var j = 0; j < chips.length; j++) chips[j].setAttribute("aria-pressed", String(chips[j] === this));
      for (var k = 0; k < cards.length; k++) cards[k].hidden = !!t && cards[k].getAttribute("data-type") !== t;
    });
  }
})();
