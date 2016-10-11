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

var Photos      = require('components/admin-photos');
var Storage     = require('components/admin-storage');
var PageEditor  = require('components/admin-page-editor');
var PagesList   = require('components/admin-pages-list');
var Menu        = require('components/admin-navigation');
var Footer      = require('components/view/footer');

require('styles/admin.scss');

var App = React.createClass({
  render() {
    return (
      <div>
        <Menu />

        {React.cloneElement(this.props.children, this.props)}

        <Footer />
      </div>
    );
  },
});

onready(() => {
  ReactDOM.render(
    <Router history={browserHistory}>
      <Route path={Lang.getLang() + '/admin/'} component={App}>
        <IndexRoute component={Photos} />

        <Route path='notes' component={PagesList} />
        <Route path='notes/:page_id' component={PageEditor} />

        <Route path='moments' component={PagesList} />
        <Route path='moments/:page_id' component={PageEditor} />

        <Route path='portfolio' component={PagesList} />
        <Route path='portfolio/:page_id' component={PageEditor} />

        <Route path='photos' component={Photos} />
        <Route path='storage' component={Storage} />
        
        <Route path='*' component={Storage} />
      </Route>
    </Router>,
    document.getElementById('react-root')
  );
});