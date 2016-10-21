var React    = require('react');
var Lang     = require('libs/lang');
var File     = require('./storage-file.js');

var FilesList = React.createClass({
  render() {
    var files = null;
    var error = null;

    files = this.props.files.map(file => {
      return (
        <div key={"file_" + file.id}>
          <File
            file={file}
            onFileSelect={this.props.onFileSelect}
          />

          <div className="storage__files-separator"></div>
        </div>
      );
    });

    if (!this.props.files.length && !this.props.loading) {
      error = Lang.get(
        this.props.media == 'all' ?
          'storage.error_files_not_uploaded_yet' :
          'storage.error_files_not_found'
      );

      error = <div>{error}</div>;
    }

    return (
      <div className="storage__files-wrapper">
        <div className="storage__files">
          {files}
          {error}
        </div>
      </div>
    );
  }
});

module.exports = FilesList;