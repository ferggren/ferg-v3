/**
 * @file Gallery Photo
 * @name GalleryPhoto
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React          = require('react');
var ContentWrapper = require('components/view/content-wrapper');

require('styles/partials/loader');

var GalleryPhoto = React.createClass({
  render() {
    return (
      <ContentWrapper>Gallery Photo</ContentWrapper>
    );
  }
});

module.exports = GalleryPhoto;