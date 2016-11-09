var initialState = '0.0.0.0';

module.exports = function(state = initialState, action) {
  switch (action.type) {
    case 'SET_IP': {
      return action.ip;
    }

    default: {
      return state;
    }
  }
}