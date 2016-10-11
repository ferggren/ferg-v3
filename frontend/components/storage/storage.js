var React = require('react');

var Uploader   = require('./storage-uploader.js');
var Uploads    = require('./storage-uploads.js');
var FilesList  = require('./storage-files-list.js');
var Options    = require('./storage-options.js');

require('./styles/storage.scss');
require('styles/partials/floating_clear');

var Storage = React.createClass({
  getInitialState() {
    return {
      files: [],
      uploads: [],
      loading: false,
      page: 1,
      group: false,
      category: 'all',
      orderby: 'latest',
    };
  },

  componentDidMount() {
    this.loadFiles();
  },

  onUpload(form_data) {
    console.log(form_data);
  },

  loadFiles() {
    console.log('loading');
    this.setState({loading: true});
  },

  render() {
    return (
      <div className="storage__wrapper">
        <Uploader
          onUpload={this.onUpload}
        />

        <Uploads />

        <FilesList
          loading={this.state.loading}
          files={this.state.files}
        />

        <Options />

        <div className="floating-clear" />
      </div>
    );
  }
});

module.exports = Storage;