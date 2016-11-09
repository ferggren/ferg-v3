import thunk from 'redux-thunk';

var lang_reducer     = require('./reducers/lang');
var location_reducer = require('./reducers/location');
var title_reducer    = require('./reducers/title');
var ip_reducer       = require('./reducers/ip');
var session_reducer  = require('./reducers/session');
var user_reducer     = require('./reducers/user');
var api_reducer      = require('./reducers/api');

var {
  applyMiddleware,
  combineReducers,
  createStore
} = require('redux');

module.exports = function (initial_state = {}) {
  const root_reducer = combineReducers({
    lang:     lang_reducer,
    location: location_reducer,
    title:    title_reducer,
    ip:       ip_reducer,
    session:  session_reducer,
    user:     user_reducer,
    api:      api_reducer,
  });

  return createStore(
    root_reducer,
    initial_state,
    applyMiddleware(thunk)
  );
}