/*
	jQuery tinyDraggable v1.0.2
    Copyright (c) 2014 Simon Steinberger / Pixabay
    GitHub: https://github.com/Pixabay/jQuery-tinyDraggable
    More info: https://pixabay.com/blog/posts/p-52/
	License: http://www.opensource.org/licenses/mit-license.php
*/

(function($) {
  $.fn.tinyDraggable = function(options, callback=function(){}) {
    var settings = $.extend({
      handle: 0,
      exclude: 0
    }, options);
    return this.each(function() {
      var dx, dy, el = $(this),
        handle = settings.handle ? $(settings.handle, el) : el;
      handle.on({
        mousedown: function(e) {
          if (settings.exclude && ~$.inArray(e.target, $(settings.exclude, el))) return;
          e.preventDefault();
          var os = el.offset();
          dx = e.pageX - os.left, dy = e.pageY - os.top;
          $(document).on('mousemove.drag', function(e) {
            var next_dx = e.pageX - dx > 0 ? e.pageX - dx : 0;
            var next_dy = e.pageY - dy > 0 ? e.pageY - dy : 0;
            el.offset({
              top: next_dy,
              left: next_dx
            });
          });
        },
        mouseup: function(e) {
          $(document).off('mousemove.drag');
          callback($(this).attr("index"), el.offset().top, el.offset().left);
        }
      });
    });
  }
}(jQuery));
