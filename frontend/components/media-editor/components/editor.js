/**
 * @file Editor Component for MediaEditor
 * @name Photos
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React = require('react');
var Lang  = require('libs/lang');

require('styles/partials/loader');

var Editor = React.createClass({
  shouldComponentUpdate(nextProps, nextState) {
    return true;
  },

  render() {
    return (
      <div>
        EDITOR
      </div>
    );
  }
});

module.exports = Editor;