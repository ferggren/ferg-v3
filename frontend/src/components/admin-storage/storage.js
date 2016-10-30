var React = require('react');
var Storage = require('components/storage');
var ContentWrapper = require('components/view/content-wrapper');

var AdminStorage = React.createClass({
  onFileSelect(file) {
    var win = window.open(
      file.link_download,
      '_blank'
    );
    
    win.focus();
  },

  render() {
    return (
      <ContentWrapper>
        <Storage 
          onFileUpload={this.onFileSelect}
          onFileSelect={this.onFileSelect}
          adminMode="enabled"
          mediaTypes="all"
        />
      </ContentWrapper>
    );
  },
});

module.exports = AdminStorage;