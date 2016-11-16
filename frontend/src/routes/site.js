var React               = require('react');
var {Route, IndexRoute} = require('react-router');

var Landing  = require('components/site/route-landing');
var Page     = require('components/site/route-page');
var Pages    = require('components/site/route-pages');
var Storage  = require('components/site/route-storage');
var Gallery  = require('components/site/route-gallery');
var Photo    = require('components/site/route-gallery-photo');
var Menu     = require('components/site/view-navigation');
var Footer   = require('components/site/view-footer');
var Title    = require('components/site/view-title-updater');
var Tracker  = require('components/site/view-tracker');
var Lang     = require('components/site/view-lang-updater');
var Progress = require('components/shared/request-progress');

var App = (props) => {
  return (
    <div className="site-wrapper">
      <Title />
      <Lang />
      <Menu />
      <Progress />
      {props.children ? React.cloneElement(props.children, props) : null}
      <Footer />
      <Tracker />
    </div>
  );
}

function makeFetchParams(location, params) {
  var ret = {};

  var match = location.pathname.match(
    /\/(?:ru|en)\/(blog|events|dev)/
  );

  if (match) {
    ret.page_type = match[1];
  }

  if (location.query) {
    for (var key in location.query) {
      ret[key] = location.query[key];
    }
  }

  if (params) {
    for (var key in params) {
      ret[key] = params[key];
    }
  }

  return ret;
}

module.exports = (store) => {
  var fetchData = function(nextState, replace, callback) {
    if (SCRIPT_ENV == 'server') {
      return callback();
    }

    var needs = [];
    var params = makeFetchParams(nextState.location, nextState.params);

    nextState.routes.forEach(route => {
      var component = route.component;

      if (!component) {
        return;
      }

      if (component.wrappedComponent) {
        component = component.wrappedComponent;
      }

      if (!component.fetchData) {
        return;
      }

      needs = needs.concat(component.fetchData(store, params));
    });

    if (!needs.length) {
      if (window.scrollTo) window.scrollTo(0, 0);
      return callback();
    }

    Promise.all(needs)
    .then(() => {
      if (window.scrollTo) window.scrollTo(0, 0);
      callback();
    })
    .catch(() => {
      if (window.scrollTo) window.scrollTo(0, 0);
      callback();
    });
  }

  var routes = [
    <IndexRoute component={Landing} key="index" onEnter={fetchData} />,
    <Route path='gallery' component={Gallery} key="gallery" onEnter={fetchData} />,
    <Route path='gallery/:photo_id' component={Photo} key="gallery_photo" onEnter={fetchData} />,
    <Route path='events' component={Pages} key="events" onEnter={fetchData} />,
    <Route path='events/:page_id' component={Page} key="events_page" onEnter={fetchData} />,
    <Route path='blog' component={Pages} key="blog" onEnter={fetchData} />,
    <Route path='blog/:page_id' component={Page} key="blog_page" onEnter={fetchData} />,
    <Route path='dev' component={Pages} key="dev" onEnter={fetchData} />,
    <Route path='dev/:page_id' component={Page} key="dev_page" onEnter={fetchData} />,
    <Route path='storage' component={Storage} key="storage" onEnter={fetchData} />,
  ];

  return routes = (
    <Route path='/' component={App}>
      {routes}
      <Route path='ru/'>{routes}</Route>
      <Route path='en/'>{routes}</Route>
      <Route path='*' component={Landing} />
    </Route>
  );
}