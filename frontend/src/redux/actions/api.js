var Request = require('libs/request');

function loadStarted(key, request, options) {
  return {
    type: 'API_LOAD_STARTED',
    request,
    key,
    options,
  }
}

function loadSuccess(key, lang, options, response) {
  return {
    type: 'API_LOAD_SUCCESS',
    key,
    response,
    lang,
    options,
  }
}

function abortRequest(key) {
  return {
    type: 'API_CLEAR_REQUEST',
    key,
  }
}

function loadError(key, lang, options, error) {
  return {
    type: 'API_LOAD_ERROR',
    error,
    key,
    lang,
    options,
  }
}
export function cancelRequest(key) {
  return {
    type: 'API_CANCEL_REQUEST',
    key,
  }
}

export function clearApiData(key) {
  return {
    type: 'API_CLEAR',
    key,
  }
}

export function makeApiRequest(key, url, options, cache) {
  return (dispatch, getState) => {
    if (typeof options != 'object') {
      options = {};
    }

    dispatch(cancelRequest(key));

    var state = getState();
    var lang    = state.lang;
    var request = false;

    options.USER_LANG = lang;

    var promise = new Promise((resolve, reject) => {
      request = Request.fetch(
        url, {
        success: response => {
          dispatch(loadSuccess(key, lang, options, response));
          resolve();
        },

        error: error => {
          dispatch(loadError(key, lang, options, error));
          resolve();
        },

        data:         options,
        cache:        !!cache,
        remote_ip:    state.ip,
        session:      state.session,
        cache_expire: cache ? 3600 : 0,
      });
    });

    dispatch(loadStarted(key, request, options));
    return promise;
  }
}