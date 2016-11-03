var React               = require('react');
var {Route, IndexRoute} = require('react-router');

var Landing  = require('components/site-landing');
var Page     = require('components/site-page');
var Pages    = require('components/site-pages');
var Storage  = require('components/site-storage');
var Menu     = require('components/site-navigation');
var Footer   = require('components/site-footer');
var Progress = require('components/request-progress');
var Gallery  = require('components/site-gallery');
var Photo    = require('components/site-gallery-photo');
var Title    = require('components/title-updater');
var Lang     = require('components/lang-updater');

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
  <Route path='moments' component={Pages} key="moments" />,
  <Route path='moments/:page_id' component={Page} key="moments_page" />,
  <Route path='notes' component={Pages} key="notes" />,
  <Route path='notes/:page_id' component={Page} key="notes_page" />,
  <Route path='portfolio' component={Pages} key="portfolio" />,
  <Route path='portfolio/:page_id' component={Page} key="portfolio_page"/>,
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