/**
 * @file Gallery Photo
 * @name GalleryPhoto
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React   = require('react');
var Wrapper = require('components/site/view-wrapper');

require('styles/partials/loader');

var GalleryPhoto = React.createClass({
  render() {
    return (
      <Wrapper>Gallery Photo</Wrapper>
    );
  }
});

module.exports = GalleryPhoto;