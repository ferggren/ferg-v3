var React = require('react');

var Uploader = React.createClass({
  shouldComponentUpdate() {
    return false;
  },

  toggleInput(e) {
    this.refs.upload_input.click();
  },

  inputOnChange(e) {
    if (typeof this.props.onUpload != 'function') {
      return false;
    }

    var form_data = new FormData(this.refs.upload_form);
    this.props.onUpload(form_data);
  },

  onDrop(e) {
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

  onDragOver(e) {
    e.preventDefault();
  },

  onDragLeave(e) {
    e.preventDefault();
    this.refs.upload_box.className = 'storage__upload';
  },

  onDragEnter(e) {
    e.preventDefault();
    this.refs.upload_box.className = 'storage__upload storage__upload--hover';
  },

  render() {
    return (
      <div className="storage__uploader">

        <div
          ref="upload_box"
          onDrop={this.onDrop}
          onDragOver={this.onDragOver}
          onDragLeave={this.onDragLeave}
          onDragEnter={this.onDragEnter}
          className="storage__upload"
          onClick={this.toggleInput}
        >
          Translate me
        </div>

        <form ref="upload_form" encType="multipart/form-data">
          <input
            ref="upload_input"
            type="file"
            multiple="false"
            name="upload"
            onChange={this.inputOnChange}
          />
        </form>
      </div>
    );
  }
});

module.exports = Uploader;