var Request = require('libs/request');

function loadStarted() {
  return {
    type: 'FEED_LOAD_STARTED',
  }
}

function loadSuccess(response, lang) {
  return {
    type: 'FEED_LOAD_SUCCESS',
    response,
    lang,
  }
}

function loadError(error) {
  return {
    type: 'FEED_LOAD_ERROR',
    error
  }
}

function setTag(tag) {
  return {
    type: 'FEED_SET_TAG',
    tag,
  }
}

export function loadFeedByTag(tag) {
  return dispatch => {
    dispatch(loadFeed(1, tag));
  }
}

export function loadFeedPage(page) {
  return (dispatch, getState) => {
    dispatch(loadFeed(page, getState().feed.tag));
  }
}

export function loadFeed(page, tag) {
  return (dispatch, getState) => {
    var lang = getState().lang;

    dispatch(setTag(tag));
    dispatch(loadStarted());

    return new Promise((resolve, reject) => {
      Request.fetch(
        '/api/feed/getFeed/', {
        success: response => {
          dispatch(loadSuccess(response, lang))
          resolve();
        },

        error: error => {
          dispatch(loadError(error))
          resolve();
        },

        data: {
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