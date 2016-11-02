var Request = require('libs/request');

function loadStarted() {
  return {
    type: 'FEED_LOAD_STARTED',
  }
}

function loadSuccess(response) {
  return {
    type: 'FEED_LOAD_SUCCESS',
    response,
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
    dispatch(setTag(tag));
    dispatch(loadStarted());

    return new Promise((resolve, reject) => {
      Request.fetch(
        '/api/feed/getFeed/', {
        success: response => {
          dispatch(loadSuccess(response))
          resolve();
        },

        error: error => {
          dispatch(loadError(error))
          resolve();
        },

        data: {
          tag,
          page,
          USER_LANG: getState().lang,
        }
      });
    })
  }
}