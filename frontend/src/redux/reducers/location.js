var initialState = false;

module.exports = function(state = initialState, action) {
  switch (action.type) {
    case 'SET_LOCATION': {
      return action.location;
    }

    default: {
      return state;
    }
  }
}