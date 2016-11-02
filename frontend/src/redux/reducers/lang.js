var initialState = 'ru';

module.exports = function(state = initialState, action) {
  switch (action.type) {
    case 'SET_LANG': {
      return action.lang;
    }

    default: {
      return state;
    }
  }
}