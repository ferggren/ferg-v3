var React          = require('react');
var PhotoLibrary   = require('components/photo-library/');
var ContentWrapper = require('components/view/content-wrapper');

var AdminPhotos = React.createClass({
  render() {
    return (
      <ContentWrapper>
        <PhotoLibrary
        	onAttach={photos => {
        		console.log(photos);
        	}}
        />
      </ContentWrapper>
    );
  }
});

module.exports = AdminPhotos;