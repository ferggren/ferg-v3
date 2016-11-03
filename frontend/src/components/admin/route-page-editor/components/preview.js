/**
 * @file Preview Component for PageEditor
 * @name Preview
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React        = require('react');
var Lang         = require('libs/lang');
var PhotoLibrary = require('components/shared/photo-library/');
var PopupWindow  = require('components/shared/popup-window');

require('styles/partials/loader');

var Preview = React.createClass({
  _loading: false,
  _preview: false,
  _photos:  false,

  getInitialState() {
    return {
      photos: false,
    };
  },

  shouldComponentUpdate(nextProps, nextState) {
    if (this._preview != nextProps.page.preview.small) {
      return true;
    }

    if (this._loading != nextProps.loading) {
      return true;
    }

    if (this._photos != nextState.photos) {
      return true;
    }

    return false;
  },

  /**
   *  Make loader
   */
  _makeLoader() {
    return <div className="page-editor__preview-loader loader-tiny" />;
  },

  /**
   *  Make preview title
   */
  _makeTitle() {
    var exists = !!this.props.page.preview.small;

    return (
      <div className="page-editor__preview-title">
        <span>
          {Lang.get('page-editor.' + (exists ? 'update' : 'set') + '_preview')}
        </span>
      </div>
    );
  },

  /**
   *  Make clear button
   */
  _makeClear() {
    return (
      <div
        className="page-editor__preview-clear"
        onClick={e => {
          e.stopPropagation();
          e.preventDefault();

          this.props.onSelect(0);
        }}
        >
        {Lang.get('page-editor.clear_preview')}
      </div>
    );
  },

  /**
   *  Make photos
   */
  _makePhotos() {
    return (
      <PopupWindow onClose={this._closePhotos}>
        <PhotoLibrary
          multiple={false}
          onSelect={this._selectPhoto}
        />
      </PopupWindow>
    );
  },

  /**
   *  Select photo
   */
  _selectPhoto(photo) {
    this.setState({photos: false});
    this.props.onSelect(photo[0]);
  },

  /**
   *  Show photo library
   */
  _showPhotos() {
    this.setState({photos: true});
  },

  /**
   *  Hide photo library
   */
  _closePhotos() {
    this.setState({photos: false});
  },

  render() {
    var preview = this.props.page.preview.small;

    this._loading = this.props.loading;
    this._preview = preview;
    this._photos  = this.state.photos;

    var loader = null;
    var title  = null;
    var clear  = null;
    var photos = null;

    if (this.props.loading) {
      loader = this._makeLoader();
    }

    if (!this.props.loading) {
      title = this._makeTitle();
    }

    if (preview && !this.props.loading) {
      clear = this._makeClear();
    }

    if (this.state.photos) {
      photos = this._makePhotos();
    }

    var style = {};

    if (preview) {
      style.backgroundImage = "url('" + preview + "')";
    }

    return (
      <div
        className="page-editor__preview"
        style={style}
        onClick={e => {
          if (!this.props.loading) {
            this._showPhotos();
          }
        }}
      >
        {loader}
        {title}
        {clear}
        {photos}
      </div>
    );
  }
});

module.exports = Preview;