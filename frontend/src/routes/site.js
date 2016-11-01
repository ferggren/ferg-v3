var React               = require('react');
var {Route, IndexRoute} = require('react-router');

var Landing  = require('components/site-landing');
var Page     = require('components/site-page');
var Pages    = require('components/site-pages');
var Storage  = require('components/site-storage');
var Menu     = require('components/site-navigation');
var Footer   = require('components/view/footer');
var Progress = require('components/request-progress');
var Gallery  = require('components/site-gallery');
var Photo    = require('components/site-gallery-photo');

var App = (props) => {
  return (
    <div>
      <Menu />
      <Progress />
      {props.children ? React.cloneElement(props.children, props) : null}
      <Footer />
    </div>
  );
}

var Moments       = () => <Pages type="moments" />;
var MomentsPage   = () => <Page type="moments" />;
var Notes         = () => <Pages type="notes" />;
var NotesPage     = () => <Page type="notes" />;
var Portfolio     = () => <Pages type="portfolio" />;
var PortfolioPage = () => <Page type="portfolio" />;

var routes = [
  <IndexRoute component={Landing} key="index" />,
  <Route path='gallery' component={Gallery} key="gallery" />,
  <Route path='gallery/:photo_id' component={Photo} key="gallery_photo" />,
  <Route path='moments' component={Moments} key="moments" />,
  <Route path='moments/:page_id' component={MomentsPage} key="moments_page" />,
  <Route path='notes' component={Notes} key="notes" />,
  <Route path='notes/:page_id' component={NotesPage} key="notes_page" />,
  <Route path='portfolio' component={Portfolio} key="portfolio" />,
  <Route path='portfolio/:page_id' component={PortfolioPage} key="portfolio_page"/>,
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