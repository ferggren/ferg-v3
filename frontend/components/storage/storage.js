var React     = require('react');
var Uploader  = require('./components/storage-uploader.js');
var Uploads   = require('./components/storage-uploads.js');
var FilesList = require('./components/storage-files.js');
var Options   = require('./components/storage-options.js');
var Request   = require('libs/request');
var Lang      = require('libs/lang');
var Paginator = require('components/paginator');

require('./storage.scss');
require('styles/partials/floating_clear');
require('styles/partials/loader');

Lang.exportStrings(
  'storage',
  require('./storage.' + Lang.getLang() + '.js')
);

var Storage = React.createClass({
  _stats_request: false,
  _files_request: false,

  getInitialState() {
    var media_types = this._validateMedia(this.props.mediaTypes);
    var media = media_types.length == 1 ? media_types[0] : 'all';

    return {
      files:       [],
      uploads:     [],
      loading:     false,
      page:        1,
      pages:       1,
      media_stats: {},
      orderby:     'latest',
      media_types,
      media,
    };
  },

  componentDidMount() {
    this._loadFiles();
    this._loadStats();
  },

  componentWillUnmount() {
    if (this._stats_request !== false) {
      Request.abort(this._stats_request);
      this._stats_request = false;
    }

    if (this._files_request !== false) {
      Request.abort(this._files_request);
      this._files_request = false;
    }
  },

  _onPageSelect(page) {
    if (this.state.loading) {
      if (this._files_request === false) {
        return;
      }

      Request.abort(this._files_request);
      this._files_request = false;
    }

    this.setState({page: page, loading: false}, this._loadFiles);
  },

  _onFileSelect(file) {
    var stats = JSON.parse(JSON.stringify(this.state.media_stats));
    stats[file.media]++;
    this.setState({media_stats: stats});
    console.log('file_select', file);
  },

  _onUpload(form_data) {
    console.log('file_upload', form_data);
  },

  _setOption(option, value) {
    if (typeof this.state[option] == 'undefined') {
      return;
    }

    if (this.state[option] == value) {
      return;
    }

    if (this.state.loading) {
      if (this._files_request === false) {
        return;
      }

      Request.abort(this._files_request);
      this._files_request = false;
    }

    var state = {
      loading: false,
      page:    1,
      pages:   1,
    };

    state[option] = value;

    this.setState(state, this._loadFiles);
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

  _loadStats() {
    this.stats_request = Request.fetch(
      '/ajax/storage/getMediaStats', {
        success: response => {
          this.stats_request = false;

          this.setState({
            media_stats: response,
          });
        },

        error: error => {
          this.stats_request = false;
        },

        data: {
          media:      this.state.media,
          group:      this.props.group ? this.props.group : '',
          admin_mode: this.props.adminMode ? 'enabled' : 'disabled',
        }
      }
    );
  },

  _loadFiles() {
    this.setState({loading: true});

    this.files_request = Request.fetch(
      '/ajax/storage/getFiles', {
        success: response => {
          this.files_request = false;

          this.setState({
            loading: false,
            files:   response.files,
            page:    response.page,
            pages:   response.pages,
          });
        },

        error: error => {
          this.files_request = false;
          this.setState({loading: false, files: []});
        },

        data: {
          page:       this.state.page,
          media:      this.state.media,
          orderby:    this.state.orderby,
          group:      this.props.group ? this.props.group : '',
          admin_mode: this.props.adminMode ? 'enabled' : 'disabled',
        }
      }
    );
  },

  render() {
    var paginator = null;
    var loader    = null;

    if (this.state.loading) {
      loader = (
        <div className="storage__loader">
          <div className="loader" />
        </div>
      );
    }

    if (!this.state.loading) {
      paginator = (
        <div className="storage__paginator">
          <Paginator
            page={this.state.page}
            pages={this.state.pages}
            onSelect={this._onPageSelect}
          />
        </div>
      );
    }

    return (
      <div className="storage__wrapper">
        <Uploader
          onUpload={this._onUpload}
        />

        <Uploads
          uploads={this.state.uploads}
        />

        <Options
          onOptionChange={this._setOption}
          orderby={this.state.orderby}
          media={this.state.media}
          mediaTypes={this.state.media_types}
          mediaStats={this.state.media_stats}
        />

        <FilesList
          loading={this.state.loading}
          files={this.state.files}
          onFileSelect={this._onFileSelect}
          media={this.state.media}
        />

        {loader}
        {paginator}

        <div className="floating-clear" />
      </div>
    );
  }
});

module.exports = Storage;