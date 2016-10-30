/**
 * @file Site Storage
 * @name SiteStorage
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React          = require('react');
var Storage        = require('components/storage');
var ContentWrapper = require('components/view/content-wrapper');

var SiteStorage = React.createClass({
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
          group="storage"
          mediaTypes="all"
        />
      </ContentWrapper>
    );
  },
});

module.exports = SiteStorage;