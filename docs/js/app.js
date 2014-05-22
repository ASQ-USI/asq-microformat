 /* JavaScript for ASQ's docs (http://asq.inf.usi.ch) Adapted from:
 * JavaScript for Bootstrap's docs (http://getbootstrap.com)
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under the Creative Commons Attribution 3.0 Unported License. For
 * details, see http://creativecommons.org/licenses/by/3.0/.
 */

!function($) {
  $(function() {
    if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
      var b = document.createElement("style");
      b.appendChild(document.createTextNode("@-ms-viewport{width:auto!important}")), document.querySelector("head").appendChild(b)
    }
    {
      var c = $(window), d = $(document.body);
      $(".navbar").outerHeight(!0) + 10
    }
    d.scrollspy({target: ".asq-docs-sidebar"}), c.on("load", function() {
      d.scrollspy("refresh")
    }), $(".asq-docs-container [href=#]").click(function(a) {
      a.preventDefault()
    }), setTimeout(function() {
      var b = $(".asq-docs-sidebar");
      // b.affix({offset: {top: function() {
      //       var c = b.offset().top, d = parseInt(b.children(0).css("margin-top"), 10), e = $(".asq-docs-nav").height();
      //       return this.top = c - e - d
      //     },bottom: function() {
      //       return this.bottom = $(".asq-docs-footer").outerHeight(!0)
      //     }}})
    }, 100), setTimeout(function() {
      $(".bs-top").affix()
    }, 100), $(".tooltip-demo").tooltip({selector: "[data-toggle=tooltip]",container: "body"}), $(".tooltip-test").tooltip(), $(".popover-test").popover(), $(".asq-docs-navbar").tooltip({selector: "a[data-toggle=tooltip]",container: ".asq-docs-navbar .nav"}), $("[data-toggle=popover]").popover(), $("#loading-example-btn").click(function() {
      var b = $(this);
      b.button("loading"), setTimeout(function() {
        b.button("reset")
      }, 3e3)
    })
    // make code pretty
    window.prettyPrint && prettyPrint()

  })
}(jQuery);
