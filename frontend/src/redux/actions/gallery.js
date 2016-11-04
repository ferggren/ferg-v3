var Request = require('libs/request');

function loadStarted() {
  return {
    type: 'GALLERY_LOAD_STARTED',
  }
}

function loadSuccess(photos, lang, tag) {
  return {
    type: 'GALLERY_LOAD_SUCCESS',
    lang,
    photos,
    tag,
  }
}

function loadError(error, lang, tag) {
  return {
    type: 'GALLERY_LOAD_ERROR',
    error,
    lang,
    tag,
  }
}

export function setPage(page) {
  return {
    type: 'GALLERY_SET_PAGE',
    page: isNaN(parseInt(page)) ? 1 : parseInt(page),
  }
}

export function loadGallery(tag) {
  return (dispatch, getState) => {
    var lang = getState().lang;

    dispatch(loadStarted());

    return new Promise((resolve, reject) => {
      Request.fetch(
        '/api/gallery/getPhotos/', {
        success: photos => {
          dispatch(loadSuccess(photos, lang, tag));
          resolve();
        },

        error: error => {
          dispatch(loadError(error, lang, tag));
          resolve();
        },

        data: {
          tag,
          USER_LANG: lang,
        },

        cache:        true,
        cache_expire: 3600,
      });
    })
  }
}