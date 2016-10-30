/**
 * @file Provides document onready support
 * @name onReady
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var is_loaded = false;
var callbacks = [];

var init = function() {
  is_loaded = true;

  for (var callback in callbacks) {
    callbacks[callback]();
  }

  callbacks = null;
}

setTimeout(function() {
  if(document.readyState == 'interactive' || document.readyState == 'complete') {
    init();
  }

  else if(window.addEventListener) {
    window.addEventListener(
      'load',
      function() {
        init();
        window.removeEventListener('load', arguments.callee);
      },
      false
    );
  }

  else if (window.attachEvent) {
    window.attachEvent(
      'onload',
      function() {
        init();
        window.detachEvent('onload', arguments.callee);
      }
    );
  }

  else {
    init();
  }
}, 100);

module.exports = function(callback) {
  if(is_loaded) {
    callback();
    return;
  }

  callbacks.push(callback);
}