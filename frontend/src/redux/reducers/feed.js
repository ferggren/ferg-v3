var clone = require('libs/clone');

var initialState = {
  page:    1,
  pages:   1,
  list:    [],
  error:   false,
  loading: false,
};

module.exports = function(state = initialState, action) {
  switch (action.type) {
    case 'FEED_LOAD_STARTED': {
      state = clone(state);

      state.list    = state.list === false ? [] : state.list;
      state.error   = false;
      state.loading = true;

      return state;
    }

    case 'FEED_LOAD_ERROR': {
      state = clone(state);

      state.error   = action.error;
      state.loading = false;

      return state;
    }

    case 'FEED_LOAD_SUCCESS': {
      state = clone(state);

      state.list    = action.response.list;
      state.error   = false;
      state.loading = false;
      state.page    = action.response.page;
      state.pages   = action.response.pages;

      return state;
    }

    case 'FEED_SET_TAG': {
      state = clone(state);

      state.tag = action.tag;

      return state;
    }

    default: {
      return state;
    }
  }
}