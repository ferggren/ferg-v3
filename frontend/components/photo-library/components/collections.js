/**
 * @file Collections components for PhotoLibrary
 * @name Collections
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React = require('react');
var Lang  = require('libs/lang');

var Collections = React.createClass({
  shouldComponentUpdate(nextProps) {
    return true;
  },

  render() {
    return (
      <div>Collections</div>
    );
  }
});

module.exports = Collections;