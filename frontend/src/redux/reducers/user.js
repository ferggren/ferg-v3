var clone = require('libs/clone');

var initialState = {};

module.exports = function(state = initialState, action) {
  switch (action.type) {
    case 'USER_LOGIN': {
      return {
        id:     action.user.id,
        name:   action.user.name,
        photo:  action.user.photo,
        groups: action.user.groups,
      }
    }

    case 'USER_LOGOUT': {
      return initialState;
    }

    default: {
      return state;
    }
  }
}