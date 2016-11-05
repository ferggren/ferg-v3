/**
 * @file Storage single file
 * @name StorageFile
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React    = require('react');
var Lang     = require('libs/lang');
var NiceTime = require('libs/nice-time');

var StorageFile = React.createClass({
  /** for shouldComponentUpdate use **/
  _loading:      false,
  _file_deleted: false,
  _lang:         false,

  /** update only when file is changed **/
  shouldComponentUpdate(nextProps) {
    if (this._loading !== nextProps.file.loading) {
      return true;
    }

    if (this._file_deleted !== nextProps.file.file_deleted) {
      return true;
    }

    if (this._lang !== Lang.getLang()) {
      return true;
    }

    return false;
  },

  /**
   *  Convert downloads number to nice form
   */ 
  _niceDownloads(downloads) {
    if (downloads <= 0) {
      return Lang.get('storage.file_not_downloaded');
    }

    return Lang.get('storage.file_downloads', {
      downloads,
    });
  },

  /**
   *  Convert unixtimestamp number to nice form 
   */ 
  _niceUploadedTime(time) {
    return NiceTime.niceTimeFormat(time);
  },

  /**
   *  Convert filesize number to nice form
   */ 
  _niceSize(size) {
    var sizes = [
      'byte',
      'kilobyte',
      'megabyte',
      'gigabyte',
    ];

    for (var i = 0; i < sizes.length; ++i) {
      if (size > 1024) {
        size = size / 1024;
        continue;
      }

      return Lang.get('storage.size_' + sizes[i], {
          'size' : (Math.round(size * 100) / 100),
      });
    }

    return Lang.get('storage.size_' + sizes[sizes.length - 1], {
      'size' : (Math.round(size * 100) / 100),
    });
  },

  render() {
    this._loading      = this.props.file.loading;
    this._file_deleted = this.props.file.file_deleted;
    this._lang         = Lang.getLang();

    var ico       = null;
    var loader    = null;
    var remove    = null;
    var restore   = null;
    var file      = this.props.file;
    var className = "storage__file-wrapper";

    if (!file.preview) {
      ico = <div className={"storage__file-ico storage__file-ico--" + file.media} />;
    }
    else {
      ico = <img className="storage__file-ico" src={file.link_preview} />;
    }

    if (file.file_deleted) {
      className += " storage__file-wrapper--deleted";
    }

    if (file.loading) {
      var loader = <div className="storage__file-loader loader-tiny"></div>;
    }
    else {
      if (file.file_deleted) {
        var restore = (
          <a
            className="storage__file-restore"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              this.props.onFileRestore(file);
            }}
          >
            {Lang.get('storage.file_restore')}
          </a>
        );
      }
      else {
        var remove = (
          <a
            className="storage__file-delete"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              this.props.onFileDelete(file);
            }}
          >
            {Lang.get('storage.file_delete')}
          </a>
        );
      }
    }

    return (
      <div
        className={className}
        onClick={(e) => { e.preventDefault(); this.props.onFileSelect(file); }}
        >
        {ico}

        <div className="storage__file-title">
          <a
            href={file.link_download}
            target="_blank"
          >{file.name}</a>
        </div>

        {remove}
        {restore}
        {loader}

        <div className="storage__file-info">
           
          <span className="storage__file-date">
            {this._niceUploadedTime(file.uploaded)}
          </span>

          <span className="storage__file-size">
            , {this._niceSize(file.size)}
          </span>

          <span className="storage__file-downloads">
            {this._niceDownloads(file.downloads)}
          </span>
        </div>
      </div>
    );
  }
});

module.exports = StorageFile;