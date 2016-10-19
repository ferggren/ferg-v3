var React     = require('react');
var Uploader  = require('./components/storage-uploader.js');
var Uploads   = require('./components/storage-uploads.js');
var FilesList = require('./components/storage-files-list.js');
var Options   = require('./components/storage-options.js');
var Request   = require('libs/request');
var Lang      = require('libs/lang');

require('./storage.scss');
require('styles/partials/floating_clear');

Lang.exportStrings(
  'storage',
  require('./storage.' + Lang.getLang() + '.js')
);

var Storage = React.createClass({
  getInitialState() {
    var media_types = this._validateMedia(this.props.mediaTypes);
    var media = media_types.length == 1 ? media_types[0] : 'all';

    return {
      files: [],
      files_error: false,
      uploads: [],
      loading: false,
      page: 1,
      media_types,
      media,
      orderby: 'latest',
    };
  },

  componentDidMount() {
    this.loadFiles();
  },

  onFileSelect(file) {
    console.log('file_select', file);
  },

  onUpload(form_data) {
    console.log('file_upload', form_data);
  },

  loadFiles() {
    console.log('load files', this.state.media, this.state.orderby, this.state.admin_mode);
    this.setState({loading: true, files_error: false});

    Request.fetch(
      '/ajax/storage/getFiles', {
        success: files => {
          this.setState({loading: false});
          console.log('onsuccess', files);
        },

        error: error => {
          this.setState({loading: false});
          console.log('onerror', error);
        },

        progress: progress => {
          console.log('onprogress', progress);
        },

        timeout: 3,

        data: {
          media: this.state.media,
          orderby: this.state.orderby,
          group: this.props.group,
          admin_mode: this.props.admin_mode,
        }
      }
    );
  },

  setOption(option, value) {
    if (this.state.loading) {
      return;
    }

    if (typeof this.state[option] == 'undefined') {
      return;
    }

    if (this.state[option] == value) {
      return;
    }

    var state = {};
    state[option] = value;

    this.setState(state, this.loadFiles);
  },

  _validateMedia(media) {
    var types = [
      'image',
      'video',
      'audio',
      'document',
      'source',
      'archive',
      'other',
    ];

    var user_types = [];

    media.split(',').forEach((media) => {
      if (types.indexOf(media.trim()) < 0) {
        return;
      }

      user_types.push(media);
    });

    if (user_types.length < 1) {
      user_types = types; 
    }

    if (user_types.length > 1) {
      user_types.unshift('all');
    }

    return user_types;
  },

  render() {
    return (
      <div className="storage__wrapper">
        <Uploader
          onUpload={this.onUpload}
        />

        <Uploads
          uploads={this.state.uploads}
        />

        <FilesList
          loading={this.state.loading}
          files={this.state.files}
          onFileSelect={this.onFileSelect}
        />

        <Options
          onOptionChange={this.setOption}
          orderby={this.state.orderby}
          media={this.state.media}
          mediaTypes={this.state.media_types}
        />

        <div className="floating-clear" />
      </div>
    );
  }
});

module.exports = Storage;