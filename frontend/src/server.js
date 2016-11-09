var React           = require('react');
var ReactDOM        = require('react-dom/server');
var express         = require('express');
var md5File         = require('md5-file')
var routes          = require('routes/site');
var { Provider }    = require('react-redux');
var configureStore  = require('redux/site-store');
var { setLang }     = require('redux/actions/lang');
var { setLocation } = require('redux/actions/location');
var { setIp }       = require('redux/actions/ip');
var { setSession }  = require('redux/actions/session');
var { userLogin }   = require('redux/actions/user');
var Lang            = require('libs/lang');
var Request         = require('libs/request');

var {match, RouterContext} = require('react-router');

var app = express();
/**
 *  Process requests
 */
app.use((req, res) => {
  // make store
  var store = configureStore();

  var user_ip      = false;
  var user_session = false;

  if (req.headers && req.headers['x-real-ip']) {
    user_ip = req.headers['x-real-ip'];
  }

  if (req.headers && req.headers.cookie) {
    var session = req.headers.cookie.match(/__session_id=([^;:\s\n\r\t]+)/);
    if (session) user_session = session[1]
  }

  store.dispatch(setIp(user_ip));
  store.dispatch(setSession(user_session));

  var promise = [];

  if (session) {
    promise.push(
      new Promise(function(resolve, reject) {
        Request.fetch(
          '/api/user/getInfo', {

          success: user => {
            resolve(user);
          },

          error: error => {
            reject(error);
          },

          cache:     false,
          remote_ip: user_ip,
          session:   user_session,
        });
      })
    );
  }

  Promise.all(promise)
  .then(user => {
    if (typeof user != 'undefined' && user.length && user[0].id) {
      store.dispatch(userLogin(user[0]));
    }

    match({routes: routes(store), location: req.url}, (error, redirect, render_props) => {
      if (redirect) {
        store = null;
        return res.redirect(301, redirect.pathname + redirect.search);
      }

      if (error) {
        store = null;
        return res.status(500).end('Internal server error');
      }

      if (!render_props) {
        store = null;
        return res.status(404).end('Not found')
      }

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
        store = null;

        res.set({
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Length': html.length,
          'ETag': ''
        });

        res.status(200).end(html);
      })
      .catch(err => {
        // catch error
        store = null;
        console.log(err);
        res.status(500).end('Internal server error');
      })
    });
  })
  .catch(err => {
    store = null;
    console.log(err);
    res.status(500).end('Internal server error');
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
  html += '<title>' + (store.title ? store.title : 'ferg.in') + '</title>';

  if (NODE_ENV != 'dev') {
    var hash = makeFileHash('./public/assets/site/site.css');
    var url = hash ? ('v_' + hash + '/') : '';

    html += '<link href="/assets/' + url + 'site/site.css" rel="stylesheet" />';
  }

  html += '</head>';

  html += '<body>';
  html += '<div class="site" id="react-root">';
  html += component_html;
  html += '</div>';

  html += '<script>window.REDUX_INITIAL_STATE = ' + JSON.stringify(store) + ';</script>';
  html += '<script>window.__CURRENT_LANG = "' + store.lang + '";</script>';

  if (NODE_ENV == 'dev') {
    html += '<script src="/assets/site/site.js?v='+Math.random()+'" async></script>';
  }
  else {
    var hash = makeFileHash('./public/assets/site/site.js');
    var url = hash ? ('v_' + hash + '/') : '';

    html += '<script src="/assets/'+url+'site/site.js" async></script>';
  }

  html += '</body>';
  html += '</html>';

  return html;
}

var _hashes_cache = {};
function makeFileHash(file) {
  if (typeof _hashes_cache[file] != 'undefined') {
    return _hashes_cache[file];
  }

  if (_hashes_cache[file] = md5File.sync(file)) {
    _hashes_cache[file] = _hashes_cache[file].substring(0, 8)
  }

  return _hashes_cache[file] ? _hashes_cache[file] : false;
}

app.disable('x-powered-by');

app.listen(NODE_PORT, () => {
  console.log(`Server listening on: ${NODE_PORT}`);
});