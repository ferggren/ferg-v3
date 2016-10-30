var React       = require('react');
var ReactDOM    = require('react-dom');
var ReactRouter = require('react-router');
var onready     = require('libs/onready');
var Lang        = require('libs/lang');

var {
  Router,
  Route,
  IndexRoute,
  browserHistory
} = require('react-router');

var Landing  = require('components/site-landing');
var Storage  = require('components/site-storage');
var Menu     = require('components/site-navigation');
var Footer   = require('components/view/footer');
var Progress = require('components/request-progress');

require('styles/site.scss');

var App = React.createClass({
  render() {
    return (
      <div>
        <Menu />
        <Progress />

        {React.cloneElement(this.props.children, this.props)}

        <Footer />
      </div>
    );
  },
});

var NotFound = React.createClass({
  componentWillMount() {
    browserHistory.push('/'+Lang.getLang()+'/');
  },

  render() {
    return null;
  }
});

onready(() => {
  ReactDOM.render(
    <Router history={browserHistory}>
      <Route path='/' component={App}>
        <IndexRoute component={Landing} />

        <Route path='ru/'>
          <IndexRoute component={Landing} />
          <Route path='storage' component={Storage} />
        </Route>

        <Route path='en/'>
          <IndexRoute component={Landing} />
          <Route path='storage' component={Storage} />
        </Route>
      
        <Route path='*' component={Landing} />
      </Route>
    </Router>,
    document.getElementById('react-root')
  );
});