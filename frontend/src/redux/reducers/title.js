var initialState = '';

module.exports = function(state = initialState, action) {
  switch (action.type) {
    case 'SET_TITLE': {
      return action.title;
    }

    default: {
      return state;
    }
  }
}