/**
 * @file Provides requests support
 * @name Request
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var Lang    = require('libs/lang');
var Cookies = require('libs/cookies');

var Request = {
  /** Requests queue */
  _requests: {},

  /** Interval for XMLHTTP readyState watcher */
  _watch_inverval: false,

  /**
   *  Send request
   *
   *  @param {url} request url
   *  @param {object} request List of request options
   *                     success - success callback
   *                     error - error callback
   *                     data - string, object (key: value) or FormData object
   *                     async - how request are sending, if false the next request will not be sended before previos is completed
   *                     timeout - amount of time after which request will be aborted
   *                     onProgress - upload progress callback
   *  @return {int} Request id
   */
  fetch(url, options) {
    options = Request._validateOptions(options);
    options.url = url;

    var request = {
      id:       Request._makeNewRequestId(),
      status:   'pending',
      options:  options,
      progress: {
        loaded: 0,
        loaded_total: 0,
        uploaded: 0,
        uploaded_total: 0,
      },
      response: null,
    };

    Request._requests[request.id] = request;
    Request._process();

    if (Request._watch_inverval == false) {
      Request._watch_inverval = setInterval(
        Request._watchStateChange,
        30
      );
    }

    return request.id;
  },

  /**
   *  Promise wrapper for Request.fetch
   *  @return {object} Promise object
   */
  promise(url, options) {
    throw new Error('coming soon');
  },

  /**
   *  Abort Request by user
   *
   *  @param {number} id Request id
   */
  abort(id, fire_callback) {
    Request._abort(id, fire_callback || false);
  },

  /**
   *  Get request progress
   *
   *  @param {number} id Request id
   */
  getProgress(id) {
    var progress = {
      loaded: 0,
      loaded_total: 0,
      uploaded: 0,
      uploaded_total: 0,
    };

    if (typeof Request._requests[id] == 'undefined') {
      return progress;
    }

    return Request._requests[id].progress;
  },

  /**
   *  Get total progress
   *
   *  @param {number} id Request id
   */
  getTotalProgress() {
    var progress = {
      requests_total: 0,
      requests_loading: 0,
      loaded: 0,
      loaded_total: 0,
      uploaded: 0,
      uploaded_total: 0,
    };

    progress.requests = 0;

    for (var request_id in Request._requests) {
      var request = Request._requests[request_id];

      progress.requests_total++;

      if (request.status != 'loading') {
        continue;
      }

      progress.requests_loading++;
      
      progress.loaded += request.progress.loaded;
      progress.loaded_total += request.progress.loaded_total;
      progress.uploaded += request.progress.uploaded;
      progress.uploaded_total += request.progress.uploaded_total;
    };

    return progress;
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

    if (typeof options.progress != 'function') {
      options.progress = false;
    }

    if (typeof options.error != 'function') {
      options.error = false;
    }

    if (typeof options.data == 'undefined') {
      options.data = {};
    }

    if (typeof options.async == 'undefined') {
      options.async = true;
    }

    if (typeof options.timeout == 'undefined') {
      options.timeout = 60;
    }

    return options;
  },

  /**
   *  Return uniq id for new request
   *  
   *  @return {number} Uniq id
   */
  _makeNewRequestId() {
    for (var i = 1; ; ++i) {
      if (typeof (Request._requests[i]) == 'object') {
        continue;
      }

      return i;
    }
  },

  /**
   *  Watch for request readyState to change
   */
  _watchStateChange() {
    var counter = 0;

    for (var request_id in Request._requests) {
      var request = Request._requests[request_id];
      ++counter;

      if (request.status != 'loading') {
        continue;
      }

      if (request.xhr.readyState != 4) {
        continue;
      }

      if (request.xhr.status != 200) {
        Request._error(request.id)
        continue;
      }

      request.response = null;

      try {
        request.response = JSON.parse(
          request.xhr.responseText
        );
      }
      catch(e) {
        Request._error(request.id)
        continue;
      }

      if (typeof request.response != 'object') {
        Request._error(request.id)
        continue;
      }

      if (typeof request.response.status == 'undefined') {
        Request._error(request.id)
        continue;
      }

      if (request.response.status != 'success') {
        if (request.response.response) {
          Request._error(request.id, request.response.response);
        }
        else {
          Request._error(request.id);
        }

        continue;
      }

      Request._success(request.id);
    };

    if (!counter && Request._watch_inverval) {
      clearInterval(Request._watch_inverval);;
      Request._watch_inverval = false;
    }
  },

  /**
  *   Find and send next request
  *   Requests that are async = false will be sended in order they was created
  *   Requests that are async = true will be sended straight away
  */
  _process() {
    var id = false;

    while (id = Request._getNextRequestId()) {
      Request._execRequest(id);
      break;
    }
  },

  /**
   *  Search for next request to be send
   */
  _getNextRequestId() {
    var keys = Object.keys(Request._requests);
    var loading = false;

    for (var id in keys) {
      id = keys[id];

      if (Request._requests[id].status != 'loading') {
        continue;
      }

      if (Request._requests[id].options.async) {
        continue;
      }

      loading = true;
      break;
    }

    for (var id in keys) {
      id = keys[id];

      if (Request._requests[id].status != 'pending') {
        continue;
      }

      if (loading && !Request._requests[id].options.async) {
        continue;
      }

      return id;
    }

    return false;
  },

  /**
   * Send ajax request
   *
   * @param {number} id Request id
   */
  _execRequest(id) {
    if (typeof Request._requests[id] != 'object') {
      delete Request._requests[id];
      return false;
    }

    var request = Request._requests[id];

    if (request.status != 'pending') {
      return false;
    }

    request.status = 'loading';

    if (!Request._makeRequestData(id)) {
      return Request._error(id);
    }

    if (!Request._makeRequestXHR(id)) {
      return Request._error(id);
    }

    // send data
    request.xhr.open('POST', request.options.url);
    request.xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    request.xhr.setRequestHeader('X-Csrf-Token', request.csrf_token);

    if (!request.isFormData) {
      request.xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    }

    request.xhr.send(request.data);

    // process next requests
    Request._process();
  },

  /**
   *  Make Request POST data
   *
   * @param {number} id Request id
   */
  _makeRequestData(id) {
    if (typeof Request._requests[id] != 'object') {
      return false;
    }

    var request = Request._requests[id];
    var data = request.options.data;
    var lang = Lang.getLang();
    var csrf_token = Cookies.getCookie('__csrf_token');

    if (!csrf_token) {
      csrf_token = Request._makeCSRFToken();
      Cookies.setCookie('__csrf_token', csrf_token, 86400 * 365);
    }

    request.csrf_token = csrf_token;
    request.isFormData = false;

    if (typeof data == 'object') {
      if (typeof data.append == 'function') {
        data.append('USER_LANG', lang);
        request.isFormData = true;
      }
      else {
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

    if (typeof data == 'string') {
      data += '&USER_LANG=' + lang;
    }

    request.data = data;

    return true;
  },

  /**
   *  Make Request XHR object
   *
   * @param {number} id Request id
   */
  _makeRequestXHR(id) {
    if (typeof Request._requests[id] != 'object') {
      return;
    }

    var request = Request._requests[id];

    var xhr = new XMLHttpRequest();
    if (!xhr) {
      return false;
    }

    request.xhr = xhr;

    // abort timer
    request._abort_timer = 0;
    if (parseInt(request.options.timeout)) {
      request._abort_timer = setTimeout(
        Request._abortByTimer,
        request.options.timeout * 1000,
        id
      );
    }

    // upload listener
    if (xhr.upload && xhr.upload.addEventListener) {
      xhr.upload._request_id = id;
      xhr.upload.addEventListener(
        'progress',
        Request._updateUploadProgress,
        false
      );
    }

    if (xhr.addEventListener) {
      xhr._request_id = id;
      xhr.addEventListener(
        'progress',
        Request._updateLoadProgress
      );
    }

    return true;
  },

  /**
   *  Abort XHR by timer
   *
   *  @param {number} id Request id
   */
  _abortByTimer(id) {
    Request._abort(id, true);
  },

  /**
   * Watch request upload progress
   *
   *  @param {object} e ProgressEvent
   */
  _updateUploadProgress(e) {
    if (!e.lengthComputable) {
      return;
    }

    if (!e.target || !e.target._request_id) {
      return;
    }

    var id = e.target._request_id;

    if (!Request._requests[id]) {
      return;
    }

    Request._requests[id].progress.uploaded = e.loaded;
    Request._requests[id].progress.uploaded_total = e.total;
    
    if (typeof Request._requests[id].options.progress != 'function') {
      return;
    }

    Request._requests[id].options.progress(
      Request._requests[id].progress
    );
  },

  /**
   * Watch request upload progress
   *
   *  @param {object} e ProgressEvent
   */
  _updateLoadProgress(e) {
    if (!e.lengthComputable) {
      return;
    }

    if (!e.target || !e.target._request_id) {
      return;
    }

    var id = e.target._request_id;

    if (!Request._requests[id]) {
      return;
    }


    Request._requests[id].progress.loaded = e.loaded;
    Request._requests[id].progress.loaded_total = e.total;
    
    if (typeof Request._requests[id].options.progress != 'function') {
      return;
    }

    Request._requests[id].options.progress(
      Request._requests[id].progress
    );
  },

  /**
   *  Abort XHR
   *
   *  @param {number} id Request id
   */
  _abort(id, fire_callback) {
    if (typeof Request._requests[id] != 'object') {
      return;
    }

    if (Request._requests[id].xhr) {
      Request._requests[id].xhr.abort();
    }

    if (fire_callback) {
      Request._error(id);
    }
    else {
      Request._deleteRequest(id);
      setTimeout(Request._process, 10);
    }
  },

  /**
   *  Call error callback of request
   *
   *  @param {number} id Request id
   *  @param {string} error Error message
   */
  _error(id, error) {
    if (typeof Request._requests[id] != 'object') {
      return;
    }

    if (typeof error == 'undefined') {
      error = 'request_runtime_error';
    }

    if (typeof Request._requests[id].options.error == 'function') {
      try {
        Request._requests[id].options.error(error);
      }
      catch(e) {
        console.log(e);
      }
    }

    Request._deleteRequest(id);
    
    setTimeout(Request._process, 10);
  },

  /**
   *  Call success callback
   *
   *  @param {number} id Request id
   */
  _success(id) {
    if (typeof Request._requests[id] != 'object') {
      return;
    }

    if (typeof Request._requests[id].options.success == 'function') {
      try {
        Request._requests[id].options.success(
            Request._requests[id].response.response
        );
      }
      catch(e) {
        console.log(e);
      }
    }

    Request._deleteRequest(id);

    setTimeout(Request._process, 10);
  },

  /**
   *  Delete request from _requests
   *
   *  @param {number} id Request id
   */
  _deleteRequest(id) {
    if (typeof Request._requests[id] != 'object') {
      return;
    }

    if (Request._requests[id].xhr &&
      Request._requests[id].xhr.upload &&
      Request._requests[id].xhr.upload.removeEventListener) {
      Request._requests[id].xhr.upload.removeEventListener(
          'progress',
          Request._updateUploadProgress
      );
    }

    if (Request._requests[id].xhr &&
      Request._requests[id].xhr.removeEventListener) {
      Request._requests[id].xhr.removeEventListener(
          'progress',
          Request._updateLoadProgress
      );
    }

    if (Request._requests[id]._abort_timer) {
      clearTimeout(Request._requests[id]._abort_timer);
      Request._requests[id]._abort_timer = false;
    }

    Request._requests[id].response = null;
    Request._requests[id].options = null;
    Request._requests[id].xhr = null;
    Request._requests[id] = null;
    
    delete Request._requests[id];
  },

  /**
   *  Generates CSRF TOKEN
   *
   *  @return {string} CSRF Token
   */
  _makeCSRFToken() {
    var set   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    var token = [];

    if (window.Uint8Array && (window.crypto || window.msCrypto)) {
      var crypto = window.crypto || window.msCrypto;
      var random = new Uint8Array(32);

      crypto.getRandomValues(random);

      random.forEach(num => {
        token.push(set.charAt(num % set.length));
      });
    }
    else {
      for (var i = 0; i < 32; ++i) {
        token.push(set.charAt(Math.floor(Math.random() * set.length)));
      }
    }

    return token.join('');
  }
};

module.exports = Request;