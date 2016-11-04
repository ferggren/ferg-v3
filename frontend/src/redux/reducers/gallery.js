var clone = require('libs/clone');

var initialState = {
  photos:  [],
  tag:     '',
  page:    1,
  rpp:     20,
  lang:    false,
  loaded:  false,
  loading: false,
  error:   false,
};

module.exports = function(state = initialState, action) {
  switch (action.type) {
    case 'GALLERY_LOAD_STARTED': {
      state = clone(state);

      state.photos  = [];
      state.error   = false;
      state.loading = true;
      state.loaded  = false;

      return state;
    }

    case 'GALLERY_LOAD_ERROR': {
      state = clone(state);

      state.error   = action.error;
      state.loading = false;
      state.loaded  = true;
      state.lang    = action.lang;
      state.tag     = action.tag;

      return state;
    }

    case 'GALLERY_LOAD_SUCCESS': {
      state = clone(state);

      state.tag     = action.tag;
      state.photos  = action.photos;
      state.error   = false;
      state.loading = false;
      state.loaded  = true;
      state.lang    = action.lang;

      return state;
    }

    case 'GALLERY_SET_PAGE': {
      state = clone(state);

      state.page = Math.max(action.page, 1);

      return state;
    }

    default: {
      return state;
    }
  }
}