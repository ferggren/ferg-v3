var clone = require('libs/clone');

var initialState = {};

module.exports = function(state = initialState, action) {
  switch (action.type) {
    case 'TAGS_LOAD_STARTED': {
      state = clone(state);

      action.groups.forEach(group => {
        state[group] = {
          loading: true,
          error:   false,
          list:    false,
        }
      });
      
      return state;
    }

    case 'TAGS_LOAD_ERROR': {
      state = clone(state);

      action.groups.forEach(group => {
        state[group].error   = action.error;
        state[group].loading = false;
      });

      return state;
    }

    case 'TAGS_LOAD_SUCCESS': {
      state = clone(state);

      action.groups.forEach(group => {
        state[group].error   = false;
        state[group].loading = false;
        state[group].list    = action.tags[group] ? action.tags[group] : false;
      });

      return state;
    }

    default: {
      return state;
    }
  }
}