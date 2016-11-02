const NODE_ENV  = process.env.NODE_ENV || 'production';
const NODE_PORT = process.env.PORT || 3000;

var React           = require('react');
var ReactDOM        = require('react-dom/server');
var express         = require('express');
var routes          = require('routes/site');
var { Provider }    = require('react-redux');
var configureStore  = require('redux/site-store');
var { setLang }     = require('redux/actions/lang');
var { setLocation } = require('redux/actions/location');
var Lang            = require('libs/lang');

var {match, RouterContext} = require('react-router');

var app = express();

/**
 *  Process requests
 */
app.use((req, res) => {
  match({routes, location: req.url}, (error, redirectLocation, renderProps) => {
    if (redirectLocation) {
      return res.redirect(301, redirectLocation.pathname + redirectLocation.search);
    }

    if (error) {
      return res.status(500).send('Internal server error');
    }

    if (!renderProps) {
      return res.status(404).send('Not found')
    }

    var store = configureStore();

    // Set user lang
    var lang = getUserLang(req);

    store.dispatch(setLang(lang));
    Lang.setLang(lang);

    // Set location
    store.dispatch(setLocation(getLocation(req)));

    var component_html = ReactDOM.renderToString(
      <Provider store={store}>
        <RouterContext {...renderProps} />
      </Provider>
    );

    console.log('done', store.getState());

    return res.status(200).end(
      renderHTML(component_html, store.getState())
    );
  });
});

/**
 *  Return user lang settings
 *
 *  @param {object} req Express req object
 *  @return {string} User lang
 */
function getUserLang(req) {
  var valid = ['ru', 'en'];

  if (req.query && req.query.USER_LANG) {
    if (valid.indexOf(req.query.USER_LANG) >= 0) {
      return req.query.USER_LANG;
    }
  }

  if (req.headers && req.headers['accept-language']) {
    var accept = req.headers['accept-language'];
    accept = accept.replace(/;/g, ',');
    accept = accept.toLowerCase().split(',');

    for (var lang in accept) {
      lang = accept[lang];

      if (valid.indexOf(lang) >= 0) {
        return lang;
      }
    }
  }

  return valid[0];
}

/**
 *  Return user location
 *
 *  @param {object} req Express req object
 *  @return {strgin} Location
 */
function getLocation(req) {
  var location = req.url;

  location = location.replace(/&?USER_LANG=(en|ru)/, '');
  location = location.replace(/[?]$/, '');
  location = location.replace(/^\/(en|ru)/, '');
  location = '/' + getUserLang(req) + location;

  return location;
}

/**
 *  Render HTML response
 *
 *  @param {string} componentHTML Injected HTML
 *  @param {store} store App store
 */
function renderHTML(component_html, store) {
  var html = '';

  html += '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">';
  html += '<html xmlns="http://www.w3.org/1999/xhtml" lang="ru">';
  html += '<head>';
  html += '<meta http-equiv="content-type" content="text/html; charset=utf-8" />';
  html += '<meta http-equiv="X-UA-Compatible" content="IE=edge" />';
  html += '<meta name="viewport" content="width=device-width, initial-scale=1" />';
    
  html += '<link rel="alternate" hreflang="x-default" href="//ferg.in/" />';
  html += '<link rel="alternate" hreflang="ru-ru" href="//ferg.in/ru/" />';
  html += '<link rel="alternate" hreflang="en-us" href="//ferg.in/en/" />';
  html += '<script>window.REDUX_INITIAL_STATE = ' + JSON.stringify(store) + ';</script>';
  html += '<script>window.__CURRENT_LANG = "' + store.lang + '";</script>';

  html += '<title>' + (store.title ? store.title : 'ferg.in') + '</title>';

  var rnd = Math.random();

  if (NODE_ENV == 'dev') {
    html += '<link href="/assets/site/site.css?v='+rnd+'" rel="stylesheet" />';
    html += '<script src="/assets/site/site.js?v='+rnd+'" defer></script>';
  }
  else {
    html += '<link href="/assets/v_asdasdas/site/site.css" rel="stylesheet" />';
    html += '<script src="/assets/v_adsasdas/site/site.js" defer></script>';
  }

  html += '</head>';

  html += '<body>';
  html += '<div class="site-wrapper" id="react-root">';
  html += component_html;
  html += '</div>';
  html += '</body>';
  html += '</html>';

  return html;
}

app.listen(NODE_PORT, () => {
  console.log(`Server listening on: ${NODE_PORT}`);
});