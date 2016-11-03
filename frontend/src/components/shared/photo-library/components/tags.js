/**
 * @file Tags components for PhotoLibrary
 * @name Tags
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React     = require('react');
var Lang      = require('libs/lang');
var TagsCloud = require('components/shared/tags-cloud');

require('styles/partials/loader');

var Tags = React.createClass({
  render() {
    if (typeof this.props.tags != 'object') {
      return (
        <div className="loader" />
      );
    };

    var clouds = [];

    var tags = [
      "camera",
      "lens",
      "iso",
      "aperture",
      "shutter_speed",
      "category",
      "fl",
      "efl",
    ];

    tags.forEach(tag => {
      if (!this.props.tags[tag] || !Object.keys(this.props.tags[tag]).length) {
        return;
      }

      if (clouds.length) {
        clouds.push(
          <div
            key={tag + "_spacing"}
            className="photolibrary__tags-spacing"
          />
        );
      }

      clouds.push(
        <TagsCloud
          key={tag + "_cloud"}
          group={tag}
          tags={this.props.tags[tag]}
          selected={this.props.selected[tag]}
          onSelect={this.props.onTagSelect}
        />
      );
    })

    return (
      <div>
        {clouds}
      </div>
    );
  }
});

module.exports = Tags;