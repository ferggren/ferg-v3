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

    return (
      <div>
        <TagsCloud
          group="camera"
          tags={this.props.tags.camera}
          selected={this.props.selected.camera}
          onSelect={this.props.onTagSelect}
        />
        <div className="photolibrary__tags-spacing" />

        <TagsCloud
          group="lens"
          tags={this.props.tags.lens}
          selected={this.props.selected.lens}
          onSelect={this.props.onTagSelect}
        />
        <div className="photolibrary__tags-spacing" />

        <TagsCloud
          group="iso"
          tags={this.props.tags.iso}
          selected={this.props.selected.iso}
          onSelect={this.props.onTagSelect}
        />
        <div className="photolibrary__tags-spacing" />

        <TagsCloud
          group="aperture"
          tags={this.props.tags.aperture}
          selected={this.props.selected.aperture}
          onSelect={this.props.onTagSelect}
        />
        <div className="photolibrary__tags-spacing" />

        <TagsCloud
          group="shutter_speed"
          tags={this.props.tags.shutter_speed}
          selected={this.props.selected.shutter_speed}
          onSelect={this.props.onTagSelect}
        />
        <div className="photolibrary__tags-spacing" />

        <TagsCloud
          group="category"
          tags={this.props.tags.category}
          selected={this.props.selected.category}
          onSelect={this.props.onTagSelect}
        />
      </div>
    );
  }
});

module.exports = Tags;