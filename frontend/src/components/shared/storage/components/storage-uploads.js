/**
 * @file Storage uploads list
 * @name Uploads
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React  = require('react');
var Upload = require('./storage-upload.js');

var Uploads = React.createClass({
  render() {
    if (!this.props.uploads.length) {
      return null;
    }

    var uploads = null;

    uploads = this.props.uploads.map(upload => {
      return (
        <Upload
          key={"file_" + upload.upload_id}
          upload={upload}
          onUploadClick={this.props.onUploadClick}
        />
      );
    });
    
    return (
      <div className="storage__uploads">
        {uploads}
      </div>
    );
  }
});

module.exports = Uploads;