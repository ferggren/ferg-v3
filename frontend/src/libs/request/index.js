if (SCRIPT_ENV == 'server') {
  module.exports = require('./request.server.js');
}
else {
  module.exports = require('./request.client.js');
}