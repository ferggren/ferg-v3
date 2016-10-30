/**
 * @file Storage uploads element
 * @name Upload
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React = require('react');
var Lang  = require('libs/lang');

var Upload = React.createClass({
    /** for shouldComponentUpdate use **/
  _progress: false,
  _status:   false,
  _error:    false,

  /** update only when upload is changed **/
  shouldComponentUpdate(nextProps) {
    if (this._progress !== nextProps.upload.progress) {
      return true;
    }

    if (this._status !== nextProps.upload.status) {
      return true;
    }

    if (this._error !== nextProps.upload.error) {
      return true;
    }

    return false;
  },

  render() {
    var upload = this.props.upload;

    this._error    = upload.error;
    this._status   = upload.status;
    this._progress = upload.progress;

    var progress   = 0;
    var title      = null;
    var status     = null;
    var class_name = 'storage__uploads-progress';

    if (upload.file_name) {
      title = upload.file_name;
    }
    else {
      title = Lang.get('storage.upload_file_placeholder');
    }

    switch(this.props.upload.status) {
      case 'scheduled': {
        progress = 0;
        status = Lang.get('storage.upload_file_scheduled');
        break;
      }

      case 'uploading': {
        progress = this.props.upload.progress;
        status  = Lang.get('storage.upload_file_uploading');
        status += ' (' + progress + '%)';
        break;
      }

      case 'success': {
        progress = 100;
        status = Lang.get('storage.upload_file_success');
        break;
      }

      case 'error': {
        progress = 100;
        status = upload.error ? upload.error : Lang.get('storage.error_file_upload_error');
        class_name += ' storage__uploads-progress--error';
        break;
      }
    }

    var progress_style  = {
      width: progress + '%',
    };

    var onclick = (e) => {
      this.props.onUploadClick(upload);
    };
    
    return (
      <div className="storage__uploads-file" onClick={onclick}>
        <div className={class_name} style={progress_style} />
        <div className="storage__uploads-title"><span>{title}</span></div>
        <div className="storage__uploads-status">{status}</div>
      </div>
    );
  }
});

module.exports = Upload;