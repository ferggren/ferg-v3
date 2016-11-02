var Request = require('libs/request');

function loadStarted(groups) {
  return {
    type: 'TAGS_LOAD_STARTED',
    groups,
  }
}

function loadSuccess(groups, tags) {
  return {
    type: 'TAGS_LOAD_SUCCESS',
    tags,
    groups,
  }
}

function loadError(groups, error) {
  return {
    type: 'TAGS_LOAD_ERROR',
    error,
    groups,
  }
}

export function loadTags(groups) {
  if (typeof groups != 'object') {
    groups = [groups];
  }

  return dispatch => {
    dispatch(loadStarted(groups));

    return new Promise((resolve, reject) => {
      Request.fetch(
        '/api/tags/getTags/', {
        success: tags => {
          dispatch(loadSuccess(groups, tags))
          resolve();
        },

        error: error => {
          dispatch(loadError(groups, error))
          resolve();
        },

        data: {
          groups: groups.join(','),
        }
      });
    })
  }
}