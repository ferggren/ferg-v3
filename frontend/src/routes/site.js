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
var Lang     = require('components/site/view-lang-updater');
var Progress = require('components/shared/request-progress');

var App = (props) => {
  return (
    <div>
      <Title />
      <Lang />
      <Menu />
      <Progress />
      {props.children ? React.cloneElement(props.children, props) : null}
      <Footer />
    </div>
  );
}

var routes = [
  <IndexRoute component={Landing} key="index" />,
  <Route path='gallery' component={Gallery} key="gallery" />,
  <Route path='gallery/:photo_id' component={Photo} key="gallery_photo" />,
  <Route path='events' component={Pages} key="events" />,
  <Route path='events/:page_id' component={Page} key="events_page" />,
  <Route path='blog' component={Pages} key="blog" />,
  <Route path='blog/:page_id' component={Page} key="blog_page" />,
  <Route path='dev' component={Pages} key="dev" />,
  <Route path='dev/:page_id' component={Page} key="dev_page"/>,
  <Route path='storage' component={Storage} key="storage" />,
];

routes = (
  <Route path='/' component={App}>
    {routes}
    <Route path='ru/'>{routes}</Route>
    <Route path='en/'>{routes}</Route>
    <Route path='*' component={Landing} />
  </Route>
);

module.exports = routes;