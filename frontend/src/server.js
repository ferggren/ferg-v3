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
  match({routes, location: req.url}, (error, redirect, render_props) => {
    if (redirect) {
      return res.redirect(301, redirect.pathname + redirect.search);
    }

    if (error) {
      return res.status(500).end('Internal server error');
    }

    if (!render_props) {
      return res.status(404).end('Not found')
    }

    // make store
    var store = configureStore();

    // parse lang
    var lang = getUserLang(req);

    // dispatch lang into store
    store.dispatch(setLang(lang));

    // Set lang (if components needed)
    Lang.setLang(lang);

    // get current location
    var loc = getLocation(req)

    // dispatch location info store
    store.dispatch(setLocation(loc));

    // make fetch params
    var fetch_params = makeFetchParams(
      req,
      loc,
      render_props.params
    );

    // fetch components data (if needed)
    fetchComponentsData(
      store,
      render_props.components,
      fetch_params
    )
    .then(() => {
      // set lang
      Lang.setLang(lang);

      // make component
      return ReactDOM.renderToString(
        <Provider store={store}>
          <RouterContext {...render_props} />
        </Provider>
      )
    })
    .then(html => {
      // make HTML response
      return renderHTML(html, store.getState());
    })
    .then(html => {
      // send HTML response
      // console.log('done', store.getState());
      res.status(200).end(html);
    })
    .catch(err => {
      // catch error
      console.log(err);
      res.status(500).end('Internal server error');
    })
  });
});

/**
 *  Find all fetchData and make a promise
 *
 *  @param {object} store App store
 *  @param {object} components React router components
 *  @param {object} fetch_params Params for fetchData
 *  @return {object} Promise
 */
function fetchComponentsData(store, components, fetch_params) {
  var needs = [];

  components.forEach(component => {
    while (component.WrappedComponent) {
      component = component.WrappedComponent;
    }

    if (!component.fetchData) {
      return;
    }

    needs = needs.concat(component.fetchData(store, fetch_params));
  });

  return Promise.all(needs);
}

/**
 *  Prepare params for fetchData
 *
 *  @param {obj} req Express req object
 *  @param {string} location Location
 *  @param {object} params React router params
 *  @return {object} Args list
 */
function makeFetchParams(req, location, params) {
  var ret = {};

  var match = location.match(
    /\/(?:ru|en)\/(blog|events|dev)/
  );

  if (match) {
    ret.page_type = match[1];
  }

  if (req.query) {
    for (var key in req.query) {
      ret[key] = req.query[key];
    }
  }

  if (params) {
    for (var key in params) {
      ret[key] = params[key];
    }
  }

  return ret;
}

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
    // html += '<link href="/assets/site/site.css?v='+rnd+'" rel="stylesheet" />';
    html += '<script src="/assets/site/site.js?v='+rnd+'" defer></script>';
  }
  else {
    html += '<link href="/assets/v_asdasdas/site/site.css" rel="stylesheet" />';
    html += '<script src="/assets/v_adsasdas/site/site.js" defer></script>';
  }

  html += '</head>';

  html += '<body>';
  html += '<div class="site" id="react-root">';
  html += component_html;
  html += '</div>';
  html += '</body>';
  html += '</html>';

  return html;
}

app.listen(NODE_PORT, () => {
  console.log(`Server listening on: ${NODE_PORT}`);
});