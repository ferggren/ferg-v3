/**
 * @file Storage uploader
 * @name Uploader
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React = require('react');
var Lang  = require('libs/lang');

var Uploader = React.createClass({
  shouldComponentUpdate() {
    if (this._lang !== Lang.getLang()) {
      return true;
    }

    return false;
  },

  /**
   *  Open upload dialog
   */
  _toggleInput(e) {
    this.refs.upload_input.click();
  },

  /**
   *  Upload file selected in _toggleInput
   */
  _inputOnChange(e) {
    if (typeof this.props.onUpload != 'function') {
      return false;
    }

    var form_data = new FormData(this.refs.upload_form);
    this.props.onUpload(form_data);
  },

  /**
   *  Upload file(s)
   */
  _onDrop(e) {
    e.preventDefault();

    this.refs.upload_box.className = 'storage__upload';

    if (typeof this.props.onUpload != 'function') {
      return false;
    }

    if (!e.dataTransfer || !e.dataTransfer.files) {
      return false;
    }

    var files = e.dataTransfer.files;
    for (var i = 0; i < files.length; i++) {
      var form = new FormData();
      form.append('upload', files[i]);

      this.props.onUpload(form);
    }
  },

  /**
   *  Just ignore it
   */
  _onDragOver(e) {
    e.preventDefault();
  },

  /**
   *  Remove hover from uploader
   */
  _onDragLeave(e) {
    e.preventDefault();
    this.refs.upload_box.className = 'storage__upload';
  },

  /**
   *  Apply hover to uploader
   */
  _onDragEnter(e) {
    e.preventDefault();
    this.refs.upload_box.className = 'storage__upload storage__upload--hover';
  },

  render() {
    this._lang = Lang.getLang();
    
    return (
      <div className="storage__uploader">

        <div
          ref="upload_box"
          onDrop={this._onDrop}
          onDragOver={this._onDragOver}
          onDragLeave={this._onDragLeave}
          onDragEnter={this._onDragEnter}
          className="storage__upload"
          onClick={this._toggleInput}
        >
          {Lang.get('storage.file_upload')}
        </div>

        <form ref="upload_form" encType="multipart/form-data">
          <input
            ref="upload_input"
            type="file"
            multiple="false"
            name="upload"
            onChange={this._inputOnChange}
          />
        </form>
      </div>
    );
  }
});

module.exports = Uploader;