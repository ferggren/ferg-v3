var Request = require('libs/request');

function loadStarted() {
  return {
    type: 'PHOTO_LOAD_STARTED',
  }
}

function loadSuccess(response, lang, tag, id) {
  return {
    type: 'PHOTO_LOAD_SUCCESS',
    lang,
    response,
    tag,
    id,
  }
}

function loadError(error, lang, tag, id) {
  return {
    type: 'PHOTO_LOAD_ERROR',
    error,
    lang,
    tag,
    id,
  }
}

export function loadPhoto(id, tag) {
  return (dispatch, getState) => {
    var lang = getState().lang;

    dispatch(loadStarted());

    return new Promise((resolve, reject) => {
      Request.fetch(
        '/api/gallery/getPhoto/', {
        success: response => {
          dispatch(loadSuccess(response, lang, tag, id));
          resolve();
        },

        error: error => {
          dispatch(loadError(error, lang, tag, id));
          resolve();
        },

        data: {
          USER_LANG: lang,
          tag,
          id,
        },

        cache:        true,
        cache_expire: 3600,
      });
    })
  }
}