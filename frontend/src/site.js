var React       = require('react');
var ReactDOM    = require('react-dom');
var onready     = require('libs/onready');
var routes      = require('./routes/site');

var {Router, browserHistory} = require('react-router');

require('styles/site.scss');

onready(() => {
  ReactDOM.render(
    <Router history={browserHistory}>
      {routes}
    </Router>,
    document.getElementById('react-root')
  );
});