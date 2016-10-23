/**
 * @file Collection components for PhotoLibrary
 * @name Collection
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React = require('react');
var Lang  = require('libs/lang');

var Collection = React.createClass({
  shouldComponentUpdate(nextProps) {
    return true;
  },

  render() {
    return (
      <div>Collection</div>
    );
  }
});

module.exports = Collection;