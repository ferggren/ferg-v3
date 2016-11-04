var Request = require('libs/request');

function loadStarted(id) {
  return {
    type: 'PAGE_LOAD_STARTED',
    id,
  }
}

function loadSuccess(page, lang) {
  return {
    type: 'PAGE_LOAD_SUCCESS',
    page,
    lang,
  }
}

function loadError(error, lang) {
  return {
    type: 'PAGE_LOAD_ERROR',
    error,
    lang,
  }
}

export function loadPage(id) {
  return (dispatch, getState) => {
    var lang = getState().lang;

    dispatch(loadStarted(id));

    return new Promise((resolve, reject) => {
      Request.fetch(
        '/api/pages/getPage/', {
        success: page => {
          dispatch(loadSuccess(page, lang))
          resolve();
        },

        error: error => {
          dispatch(loadError(error, lang))
          resolve();
        },

        data: {
          id,
          USER_LANG: lang,
        },

        cache:        true,
        cache_expire: 3600,
      });
    })
  }
}