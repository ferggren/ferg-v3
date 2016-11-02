'use strict';

require('babel-core/register');

var ext_ignore = ['.css', '.less', '.sass', '.scss', '.ttf', '.woff', '.woff2'];
ext_ignore.forEach(ext => {
  require.extensions[ext] = () => {}
});

require('babel-polyfill');
require('./src/server.js');