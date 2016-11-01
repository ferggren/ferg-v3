/**
 * @file Site Gallery
 * @name SiteGallery
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React          = require('react');
var ContentWrapper = require('components/view/content-wrapper');

require('styles/partials/loader');

var SiteGallery = React.createClass({
  render() {
    return (
      <ContentWrapper>Gallery</ContentWrapper>
    );
  }
});

module.exports = SiteGallery;