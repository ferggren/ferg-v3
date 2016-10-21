/**
 * @file Storage component
 * @name Storage
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

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
  /** stats request id **/
  _stats_request: false,

  /** file delete & restore request **/
  _file_request: false,

  /** load files request id **/
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

  /**
   *  Load files & stats 
   */
  componentDidMount() {
    this._loadFiles();
    this._loadStats();
  },

  /**
   *  Abort any connections
   */
  componentWillUnmount() {
    if (this._stats_request !== false) {
      Request.abort(this._stats_request);
      this._stats_request = false;
    }

    if (this._files_request !== false) {
      Request.abort(this._files_request);
      this._files_request = false;
    }

    this._clearFilesRequests();
  },

  /**
   * Clear all requests for deleting & restoring files
   */
  _clearFilesRequests() {
    this.state.files.map(file => {
      if (typeof file._request_id == 'undefined') return;
      if (file._request_id === false) return;


      Request.abort(file._request_id);
      file._request_id = false;
    });
  },

  /**
   *  Page selected in paginator
   */
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

  /**
   *  File selected in FilesList
   */
  _onFileSelect(file) {
    var stats = JSON.parse(JSON.stringify(this.state.media_stats));
    stats[file.media]++;
    this.setState({media_stats: stats});
    console.log('file_select', file);
  },

  /**
   *  File uploaded in Uploader
   */
  _onUpload(form_data) {
    console.log('file_upload', form_data);
  },

  /**
   *  File deleted in FilesList
   */
  _onFileDelete(deleted_file) {
    this.state.files.forEach(file => {
      if (file.id != deleted_file.id) {
        return;
      }

      file._request_id = Request.fetch(
        '/ajax/storage/deleteFile', {
          success: () => {
            file.file_deleted = true;
            file._request_id = false;

            this.setState({
              files: this.state.files,
            });
          },

          error: error => {
            file._request_id = false;

            this.setState({
              files: this.state.files,
            });
          },

          data: {
            file_id: file.id,
          }
        }
      );
    });

    this.setState({files: this.state.files});
  },

  /**
   *  File restored in FilesList
   */
  _onFileRestore(restored_file) {
    this.state.files.forEach(file => {
      if (file.id != restored_file.id) {
        return;
      }

      file._request_id = Request.fetch(
        '/ajax/storage/restoreFile', {
          success: () => {
            file.file_deleted = false;
            file._request_id = false;

            this.setState({
              files: this.state.files,
            });
          },

          error: error => {
            file._request_id = false;
            
            this.setState({
              files: this.state.files,
            });
          },

          data: {
            file_id: file.id,
          }
        }
      );
    });

    this.setState({files: this.state.files});
  },

  /**
   *  Option changed in StorageOptions
   */
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

  /**
   *  Validate media types
   *
   *  @param {string} media Comma separated media types string
   *  @return {object} Validated media
   */
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

  /**
   *  Load media stats
   */
  _loadStats() {
    this._stats_request = Request.fetch(
      '/ajax/storage/getMediaStats', {
        success: stats => {
          this._stats_request = false;

          this.setState({
            media_stats: stats,
          });
        },

        error: error => {
          this._stats_request = false;
        },

        data: {
          media:      this.state.media,
          group:      this.props.group ? this.props.group : '',
          admin_mode: this.props.adminMode ? 'enabled' : 'disabled',
        }
      }
    );
  },

  /**
   *  Load files list
   */
  _loadFiles() {
    this.setState({loading: true});
    this._clearFilesRequests();

    this._files_request = Request.fetch(
      '/ajax/storage/getFiles', {
        success: response => {
          this._files_request = false;

          this.setState({
            loading: false,
            files:   response.files,
            page:    response.page,
            pages:   response.pages,
          });
        },

        error: error => {
          this._files_request = false;
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
          media_types={this.state.media_types}
          media_stats={this.state.media_stats}
        />

        <FilesList
          loading={this.state.loading}
          files={this.state.files}
          onFileSelect={this._onFileSelect}
          onFileDelete={this._onFileDelete}
          onFileRestore={this._onFileRestore}
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