/**
 * @file Provides cookies support
 * @name Cookies
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

 var Cookies = {
  /**
   *  Set cookie
   *
   *  @param {string} name Cookie name
   *  @param {string} value Cookie value
   *  @param {number} expires Cookie expiration time
   */
  setCookie(name, value, expires) {
    expires = parseInt(expires);

    if (isNaN(expires)) {
      expires = "";
    }
    else {        
      var date = new Date();
      date.setTime(date.getTime() + (expires * 1000));
      expires = "; expires=" + date.toGMTString();
    }

    name = Cookies.escape(name);
    value = Cookies.escape(value);

    if (name.length < 1) {
      return false;
    }

    document.cookie = name + "=" + value + expires + "; path=/";
  },

  escape(value) {
    return value.replace(/[;\s\n\r=,$"\\]/g, '');
  },

  /**
   *  Remove cookie
   *
   *  @param {string} name Cookie name
   */
  removeCookie(name) {
    Cookies.setCookie(name, "", -86400 * 365);
  },

  /**
   *  Get cookie value
   *
   *  @param {string} name Cookie name
   *  @return {string} Cookie value
   */
  getCookie(name) {
    name = Cookies.escape(name) + '=';
    var cookies = document.cookie.split(';');

    for (var i = 0; i < cookies.length; ++i) {
      var cookie = cookies[i].trim();

      if (cookie.indexOf(name) != 0) {
        continue;
      }

      return cookie.substring(name.length);
    }

    return "";
  },
 };

 module.exports = Cookies;