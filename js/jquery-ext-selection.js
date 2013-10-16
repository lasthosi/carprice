/// <reference path="jquery.js"/>
(function ($) {
    var sel = function () {
        return new sel.fn.init();
    };
    sel.fn = sel.prototype = {
        init: function () {

        }
    };
    sel.fn.init.prototype = sel.fn;
    $.extend({
        sel: sel
    });

})(window.jQuery);