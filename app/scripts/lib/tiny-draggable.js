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
      var moved_flg;
      handle.on({
        mousedown: function(e) {
          moved_flg = false;
          if (settings.exclude && ~$.inArray(e.target, $(settings.exclude, el))) return;
          el.addClass('moving');
          e.preventDefault();
          var os = el.offset();
          dx = e.pageX - os.left, dy = e.pageY - os.top;
          $(document).on('mousemove.drag', function(e) {
            moved_flg = true;
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
          el.removeClass('moving');
          if(moved_flg) {
            callback($(this).attr("index"), el.offset().top, el.offset().left);
          }
        }
      });
    });
  }
}(jQuery));
