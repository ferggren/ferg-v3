var clone = require('libs/clone');

var initialState = {
  page:    1,
  pages:   1,
  list:    [],
  error:   false,
  loading: false,
  lang:    false,
  type:    false,
};

module.exports = function(state = initialState, action) {
  switch (action.type) {
    case 'PAGES_LOAD_STARTED': {
      state = clone(state);

      state.list    = state.list === false ? [] : state.list;
      state.error   = false;
      state.loading = true;

      return state;
    }

    case 'PAGES_LOAD_ERROR': {
      state = clone(state);

      state.error   = action.error;
      state.loading = false;

      return state;
    }

    case 'PAGES_LOAD_SUCCESS': {
      state = clone(state);

      state.list    = action.response.list;
      state.error   = false;
      state.loading = false;
      state.page    = action.response.page;
      state.pages   = action.response.pages;
      state.lang    = action.lang;
      state.type    = action.pages_type;

      return state;
    }

    case 'PAGES_SET_TAG': {
      state = clone(state);

      state.tag   = action.tag;
      state.list  = [];
      state.page  = 1;
      state.pages = 1;
      state.error = false;

      return state;
    }

    case 'PAGES_SET_TYPE': {
      state = clone(state);

      state.type = action.pages_type;
      state.list  = false;
      state.page  = 1;
      state.pages = 1;
      state.error = false;

      return state;
    }

    default: {
      return state;
    }
  }
}