var React          = require('react');
var Storage        = require('components/shared/storage');
var ContentWrapper = require('components/admin/view-wrapper');

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