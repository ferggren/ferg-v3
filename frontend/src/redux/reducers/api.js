var clone   = require('libs/clone');
var Request = require('libs/request');

var initialState = {};

module.exports = function(state = initialState, action) {
  switch (action.type) {
    case 'API_CANCEL_REQUEST': {
      if (typeof state[action.key] == 'undefined') {
        return state;
      }

      if (!state[action.key].request) {
        return state;
      }

      Request.abort(state[action.key].request, true);

      state = clone(state);
      state[action.key].request = false;

      return state;
    }

    case 'API_LOAD_STARTED': {
      state = clone(state);

      if (typeof state[action.key] == 'undefined') {
        state[action.key] = {
          data:    {},
        };
      }

      state[action.key].options = action.options;
      state[action.key].request = action.request;
      state[action.key].loading = true;
      state[action.key].loaded  = false;
      state[action.key].error   = false;
      
      return state;
    }

    case 'API_LOAD_ERROR': {
      state = clone(state);

      state[action.key].request = false;
      state[action.key].loading = false;
      state[action.key].loaded  = true;
      state[action.key].error   = action.error;
      state[action.key].options = action.options;
      state[action.key].lang    = action.lang;

      return state;
    }

    case 'API_LOAD_SUCCESS': {
      state = clone(state);

      state[action.key].request = false;
      state[action.key].loading = false;
      state[action.key].loaded  = true;
      state[action.key].error   = false;
      state[action.key].options = action.options;
      state[action.key].lang    = action.lang;
      state[action.key].data    = action.response;

      return state;
    }

    case 'API_CLEAR': {
      if (typeof state[action.key] == 'undefined') {
        return state;
      }

      state = clone(state);

      state[action.key] = null;
      delete state[action.key];

      return state;
    }

    default: {
      return state;
    }
  }
}