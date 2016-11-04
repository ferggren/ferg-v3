var clone = require('libs/clone');

var initialState = {
  id:     false,
  prev:   [],
  next:   [],
  info:  {},
  tag:     '',
  lang:    false,
  loaded:  false,
  loading: false,
  error:   false,
};

module.exports = function(state = initialState, action) {
  switch (action.type) {
    case 'PHOTO_LOAD_STARTED': {
      state = clone(state);

      state.prev    = [];
      state.next    = [];
      state.error   = false;
      state.loading = true;
      state.loaded  = false;

      return state;
    }

    case 'PHOTO_LOAD_ERROR': {
      state = clone(state);

      state.error   = action.error;
      state.loading = false;
      state.loaded  = true;
      state.lang    = action.lang;
      state.tag     = action.tag;
      state.id      = action.id;

      return state;
    }

    case 'PHOTO_LOAD_SUCCESS': {
      state = clone(state);

      state.tag     = action.tag;
      state.id      = action.id;
      state.info    = action.response.info;
      state.prev    = action.response.prev;
      state.next    = action.response.next;
      state.error   = false;
      state.loading = false;
      state.loaded  = true;
      state.lang    = action.lang;

      return state;
    }

    default: {
      return state;
    }
  }
}