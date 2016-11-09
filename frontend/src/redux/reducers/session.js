var initialState = '';

module.exports = function(state = initialState, action) {
  switch (action.type) {
    case 'SET_SESSION': {
      return action.session;
    }

    default: {
      return state;
    }
  }
}