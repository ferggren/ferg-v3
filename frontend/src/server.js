const NODE_ENV  = process.env.NODE_ENV || 'production';
const NODE_PORT = process.env.PORT || 3000;

var React    = require('react');
var ReactDOM = require('react-dom/server');
var express  = require('express');
var routes   = require('routes/site');

var {match, RouterContext} = require('react-router');

var app = express();

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

    var componentHTML = ReactDOM.renderToString(
      <RouterContext {...renderProps} />
    );

    return res.status(200).end(renderHTML(componentHTML));
  });

  res.end(renderHTML('<div style="text-align: center; margin-top: 30px;">Loading...</div>'));
});

function renderHTML(componentHTML) {
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

  html += '<title></title>';

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
  html += componentHTML;
  html += '</div>';
  html += '</body>';
  html += '</html>';

  return html;
}

app.listen(NODE_PORT, () => {
  console.log(`Server listening on: ${NODE_PORT}`);
});