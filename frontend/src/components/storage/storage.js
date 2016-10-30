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
  require('./storage.lang-' + Lang.getLang() + '.js')
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

    this.state.uploads.forEach(upload => {
      if (upload.request_id === false) {
        return;
      }

      Request.abort(upload.request_id);
      upload.request_id = false;
    });

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
    this._changeStats(file.media, 1);

    if (typeof this.props.onFileSelect == 'function') {
      this.props.onFileSelect(file);
    }
  },

  /**
   *  File uploaded in Uploader
   */
  _upload_id: 1,
  _onUpload(form_data) {
    var upload = {
      upload_id:  (++this._upload_id),
      progress:   0,
      request_id: false,
      file_name:  false,
      status:     'scheduled',
      error:      false,
    };

    if (form_data.get) {
      var file = form_data.get('upload');

      if (file && file.name) {
        upload.file_name = file.name;
      }
    }

    form_data.append(
      'file_access',
      this.props.upload_access == 'private' ? 'private' : 'public'
    );

    form_data.append(
      'file_group',
      this.props.group ? this.props.group : ''
    );

    form_data.append(
      'file_media',
      this.state.media_types.join(',')
    );

    upload.request_id = Request.fetch(
      '/api/storage/upload', {
        success: file => {
          upload.progress = 100;
          upload.request_id = false;
          upload.status = 'success';

          this.setState({uploads: this.state.uploads});

          this._onFileUploaded(file, upload);
        },

        error: error => {
          upload.progress = 100;
          upload.request_id = false;
          upload.status = 'error';
          upload.error = Lang.get('storage.' + error);

          this.setState({uploads: this.state.uploads});
        },

        progress: progress => {
          upload.status = 'uploading';

          if (!progress.uploaded_total) {
            return;
          }

          progress = (progress.uploaded * 100) / progress.uploaded_total;
          progress = Math.floor(progress);

          if (upload.progress == progress) {
            return;
          }

          upload.progress = progress;
          this.setState({uploads: this.state.uploads});
        },

        data: form_data,

        async: false,
      }
    );

    var uploads = this.state.uploads;
    uploads.push(upload);

    this.setState({uploads});
  },

  /**
   *  Successful file upload
   */
  _onFileUploaded(file, upload) {
    var media = this.state.media;
    var page  = this.state.page;

    this._changeStats(file.media, 1);

    if (page == 1 && (media == 'all' || media == file.media)) {
      if (this._files_request !== false) {
        Request.abort(this._files_request);
        this._files_request = false;
      }

      this._loadFiles();
      this._onUploadClick(upload);
    }

    if (typeof this.props.onFileUpload == 'function') {
      this.props.onFileUpload(file);
    }
  },

  /**
   *  Upload clicked on in Uploader
   */
  _onUploadClick(upload) {
    if (upload.request_id !== false) {
      Request.abort(upload.request_id);
      upload.request_id = false;
    }

    var uploads = [];

    for (var i in this.state.uploads) {
      if (this.state.uploads[i].upload_id == upload.upload_id) {
        continue;
      }

      uploads.push(this.state.uploads[i]);
    }

    this.setState({uploads});
  },

  /**
   *  File deleted in FilesList
   */
  _onFileDelete(deleted_file) {
    this.state.files.forEach(file => {
      if (file.id != deleted_file.id) {
        return;
      }

      file.loading = true;
      file._request_id = Request.fetch(
        '/api/storage/deleteFile', {
          success: () => {
            file.loading = false;
            file.file_deleted = true;
            file._request_id = false;

            this._changeStats(file.media, -1);

            this.setState({
              files: this.state.files,
            });
          },

          error: error => {
            file.loading = false;
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

      file.loading = true;
      file._request_id = Request.fetch(
        '/api/storage/restoreFile', {
          success: () => {
            file.loading = false;
            file.file_deleted = false;
            file._request_id = false;
            this._changeStats(file.media, 1);

            this.setState({
              files: this.state.files,
            });
          },

          error: error => {
            file.loading = false;
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
    if (this.props.mode == "uploader") {
      return;
    }
    
    this._stats_request = Request.fetch(
      '/api/storage/getMediaStats', {
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
    if (this.props.mode == "uploader") {
      return;
    }

    this.setState({loading: true});
    this._clearFilesRequests();

    this._files_request = Request.fetch(
      '/api/storage/getFiles', {
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

  /**
   *  Increase/Decrease values in media stats
   */
  _changeStats(stat, amount) {
    var stats = JSON.parse(JSON.stringify(this.state.media_stats));

    if (typeof stats[stat] == 'undefined') {
      stats[stat] = 0;
    }

    stats[stat] += amount;

    if (stats[stat] < 0) {
      stats[stat] = 0;
    }

    this.setState({media_stats: stats});
  },

  render() {
    var paginator = null;
    var loader    = null;
    var uploader  = null;
    var uploads   = null;
    var options   = null;
    var files     = null;

    if (this.props.group) {
      uploader = (
        <Uploader
          onUpload={this._onUpload}
        />
      );

      uploads = (
        <Uploads
          uploads={this.state.uploads}
          onUploadClick={this._onUploadClick}
        />
      );
    }

    if (this.props.mode != "uploader") {
      options = (
        <Options
          onOptionChange={this._setOption}
          orderby={this.state.orderby}
          media={this.state.media}
          media_types={this.state.media_types}
          media_stats={this.state.media_stats}
        />
      );

      files = (
        <FilesList
          loading={this.state.loading}
          files={this.state.files}
          onFileSelect={this._onFileSelect}
          onFileDelete={this._onFileDelete}
          onFileRestore={this._onFileRestore}
          media={this.state.media}
        />
      );

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
    }

    return (
      <div className="storage__wrapper">
        {uploader}
        {uploads}
        {options}
        {files}
        {loader}
        {paginator}
        <div className="floating-clear" />
      </div>
    );
  }
});

module.exports = Storage;