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
  /**
   *  Convert downloads number to nice form
   */ 
  _niceDownloads(downloads) {
    if (downloads <= 0) {
      return Lang.get('storage.file_not_downloaded');
    }

    return Lang.get('storage.file_downloads', {
      downloads: downloads,
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

    if (typeof file._request_id != 'undefined' && file._request_id !== false) {
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