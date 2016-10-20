var React    = require('react');
var Lang     = require('libs/lang');
var NiceTime = require('libs/nice-time');

require('styles/partials/loader');

var FilesList = React.createClass({
  _niceDownloads(downloads) {
    if (downloads <= 0) {
      return Lang.get('storage.file_not_downloaded');
    }

    return Lang.get('storage.file_downloads', {
      downloads: downloads,
    });
  },

  _niceUploadedTime(time) {
    return NiceTime.niceTimeFormat(time);
  },

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
    var loader = null;
    var files = null;

    if (this.props.files.length) {
      files = this.props.files.map(file => {
        var key = "file_" + file.id;

        var wrapperClassName = "storage__file-wrapper";
        var style = {};

        if (file.preview && this.props.media == "image") {
          wrapperClassName += " storage__file-wrapper--preview";
          style.backgroundImage = "url('" + file.link_preview + "')"
        }

        var icoClassName = "storage__file-ico";
        icoClassName += " storage__file-ico--" + file.media;

        return (
          <div key={key}>
            <div className={wrapperClassName} style={style}>
              <div className={icoClassName}></div>

              <div className="storage__file-date">
                {this._niceUploadedTime(file.uploaded)}
              </div>

              <a
                className="storage__file-title"
                href={file.link_download} target="_blank"
                onClick={(e) => { e.preventDefault(); this.props.onFileSelect(file); }}
              >
                {file.name}
              </a>

              <div className="storage__file-info">
                <span className="storage__file-size">
                  {this._niceSize(file.size)}
                </span>

                <span className="storage__file-downloads">
                  , {this._niceDownloads(file.downloads)}
                </span>
              </div>
            </div>
            <div className="storage__files-separator"></div>
          </div>
        );
      });
    }

    if (!files && this.props.loading) {
      loader = <div className="loader"></div>;
    }

    if (!files && !this.props.loading) {
      files = (
        <div>
          {Lang.get('storage.error_files_not_uploaded_yet')}
        </div>
      );
    }

    return (
      <div className="storage__files-wrapper">
        <div className="storage__files">
          {loader}
          {files}
        </div>
      </div>
    );
  }
});

module.exports = FilesList;