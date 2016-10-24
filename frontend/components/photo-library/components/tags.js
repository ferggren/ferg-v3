/**
 * @file Tags components for PhotoLibrary
 * @name Tags
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React     = require('react');
var Lang      = require('libs/lang');
var TagsCloud = require('components/tags-cloud');

require('styles/partials/loader');

var Tags = React.createClass({
  render() {
    if (typeof this.props.tags != 'object') {
      return (
        <div className="loader" />
      );
    }

    // console.log(this.props.tags, this.props.selected);

    return (
      <div>
        <TagsCloud/>
        <div className="photolibrary__tags-spacing" />
      </div>
    );
  }
});

module.exports = Tags;