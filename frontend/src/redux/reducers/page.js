var clone = require('libs/clone');

var initialState = {
  info:    false,
  lang:    false,
  error:   false,
  loading: false,
  id:      false,
};

module.exports = function(state = initialState, action) {
  switch (action.type) {
    case 'PAGE_LOAD_STARTED': {
      state = clone(state);

      state.info    = false;
      state.error   = false;
      state.loading = true;
      state.id      = action.id;

      return state;
    }

    case 'PAGE_LOAD_ERROR': {
      state = clone(state);

      state.lang    = action.lang;
      state.error   = action.error;
      state.loading = false;

      return state;
    }

    case 'PAGE_LOAD_SUCCESS': {
      state = clone(state);

      state.info    = action.page;
      state.error   = false;
      state.loading = false;
      state.lang    = action.lang;
      state.id      = action.page.id;

      return state;
    }

    default: {
      return state;
    }
  }
}