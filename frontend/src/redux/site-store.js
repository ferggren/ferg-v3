import thunk from 'redux-thunk';

var lang_reducer     = require('./reducers/lang');
var location_reducer = require('./reducers/location');
var title_reducer    = require('./reducers/title');
var feed_reducer     = require('./reducers/feed');
var tags_reducer     = require('./reducers/tags');
var pages_reducer    = require('./reducers/pages');

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
    feed:     feed_reducer,
    tags:     tags_reducer,
    pages:    pages_reducer,
  });

  return createStore(
    root_reducer,
    initial_state,
    applyMiddleware(thunk)
  );
}