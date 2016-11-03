var React           = require('react');
var ReactDOM        = require('react-dom');
var onready         = require('libs/onready');
var { Provider }    = require('react-redux');
var configureStore  = require('redux/site-store');
var { setLocation } = require('redux/actions/location');
var { connect }     = require('react-redux');
var routes          = require('./routes/site');

var {Router, browserHistory} = require('react-router');

require('styles/site.scss');

onready(() => {
  var store = configureStore(window.REDUX_INITIAL_STATE || {});

  /**
   *  Watch location changes
   */
  browserHistory.listen(location => {
    var state = store.getState();

    location = location.pathname + location.search;

    location = location.replace(/[?]$/, '');
    if (!location.match(/^\/(en|ru)/)) {
      location = location.replace(/^\/(en|ru)/, '');
      location = '/' + state.lang + location;
    }

    if (state.location == location) {
      return;
    }
    
    store.dispatch(setLocation(location));
  });

  ReactDOM.render(
    <Provider store={store}>
      <Router history={browserHistory}>
        {routes}
      </Router>
    </Provider>,
    document.getElementById('react-root')
  );
});