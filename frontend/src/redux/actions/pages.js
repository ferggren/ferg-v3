var Request = require('libs/request');

function loadStarted() {
  return {
    type: 'PAGES_LOAD_STARTED',
  }
}

function loadSuccess(response, pages_type, lang) {
  return {
    type: 'PAGES_LOAD_SUCCESS',
    response,
    lang,
    pages_type,
  }
}

function loadError(error) {
  return {
    type: 'PAGES_LOAD_ERROR',
    error,
  }
}

function setTag(tag) {
  return {
    type: 'PAGES_SET_TAG',
    tag,
  }
}

export function setPagesType(type) {
  return {
    type: 'PAGES_SET_TYPE',
    pages_type: type,
  }
}

export function loadPages(page, tag) {
  return (dispatch, getState) => {
    var lang = getState().lang;
    var type = getState().pages.type;

    dispatch(setTag(tag));
    dispatch(loadStarted());

    return new Promise((resolve, reject) => {
      Request.fetch(
        '/api/pages/getPages/', {
        success: response => {
          dispatch(loadSuccess(response, type, lang))
          resolve();
        },

        error: error => {
          dispatch(loadError(error))
          resolve();
        },

        data: {
          type,
          tag,
          page,
          USER_LANG: lang,
        },

        cache:        true,
        cache_expire: 3600,
      });
    })
  }
}