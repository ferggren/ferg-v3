/**
 * @file Provides requests support
 * @name Request
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var fetch = require('node-fetch');

var Lang    = require('libs/lang');
var Cookies = require('libs/cookies');

var Request = {
  _csrf: false,

  /**
   *  Send request
   *
   *  @param {url} request url
   *  @param {object} request List of request options
   *                     success - success callback
   *                     error - error callback
   *                     data - string, object (key: value) or FormData object
   *                     timeout - amount of time after which request will be aborted
   *  @return {int} Request id
   */
  fetch(url, options) {
    options = Request._validateOptions(options);

    var url     = Request._makeUrl(url);
    var headers = Request._makeHeaders();
    var body    = Request._makeBody(options.data);

    fetch(url, {method: 'POST', body, headers})
    .then(function(res) {
      return res.json();
    })
    .then(function(json) {
      if (!json.status) {
        return options.error('internal_server_error');
      }

      if (json.status != 'success') {
        return options.error(
          json.response ? json.response : 'internal_server_error'
        );
      }

      options.success(json.response);
    })
    .catch(err => {
      options.error(err);
    });
  },

  /**
   *  Make fetch headers
   *
   *  @return {object} Fetch headers
   */
  _makeHeaders() {
    var csrf_token = Request._getCSRFToken();

    return {
      'X-Requested-With': 'XMLHttpRequest',
      'X-Csrf-Token':     csrf_token,
      'Content-Type':     'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie':           '__csrf_token=' + csrf_token,
    }
  },

  /**
   *  Process fetch url (add API HOST, if needed)
   *
   *  @param {string} url original url
   *  @return {string} Processed url
   */
  _makeUrl(url) {
    if (url.charAt(0) == '/') url = API_HOST + url;
    return url;
  },


  /**
   *  Make fetch body
   *
   *  @param {object} data request data
   *  @return {string} Fetch data
   */
  _makeBody(data) {
    if (typeof data == 'object') {
      if (typeof data.append != 'function') {
        var str = '';

        for (var key in data) {
          str += '&';
          str += encodeURIComponent(key);
          str += '=';
          str += encodeURIComponent(data[key]);
        }

        data = str;
      }
    }

    return data;
  },


  /**
   *  Return CSRF Token
   *
   *  @return {string} CSRF Token
   */
  _getCSRFToken() {
    if (Request._csrf) {
      return Request._csrf;
    }

    var set   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    var token = [];

    for (var i = 0; i < 32; ++i) {
      token.push(set.charAt(Math.floor(Math.random() * set.length)));
    }

    return Request._csrf = token.join('');
  },

  /**
   *  Placeholder
   */
  promise(url, options) {
    throw new Error('not supported');
  },

  /**
   *  Placeholder
   */
  abort() {
    return false;
  },

  /**
   *  Placeholder
   */
  getProgress() {
    return progress = {
      loaded: 0,
      loaded_total: 0,
      uploaded: 0,
      uploaded_total: 0,
    };
  },

  /**
   *  Placeholder
   */
  getTotalProgress() {
    return progress = {
      requests_total: 0,
      requests_loading: 0,
      loaded: 0,
      loaded_total: 0,
      uploaded: 0,
      uploaded_total: 0,
    };
  },

  /**
   *  Validate options
   *
   *  @param {object} raw options
   *  @return {object} validated options
   */
  _validateOptions(options) {
    if (typeof options != 'object') {
      options = {};
    }

    if (typeof options.success != 'function') {
      request.success = false;
    }

    if (typeof options.error != 'function') {
      options.error = false;
    }

    if (typeof options.data == 'undefined') {
      options.data = {};
    }

    if (typeof options.timeout == 'undefined') {
      options.timeout = 60;
    }

    return options;
  },
};

module.exports = Request;