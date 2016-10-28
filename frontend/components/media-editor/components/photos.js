/**
 * @file Photos Component for MediaEditor
 * @name Photos
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React        = require('react');
var Lang         = require('libs/lang');
var PhotoLibrary = require('components/photo-library/');
var PopupWindow  = require('components/popup-window');
var Photo        = require('./photo');

var Photos = React.createClass({
  _deleted: 0,
  _loading: 0,

  getInitialState() {
    return {
      show_library: false,
    }
  },

  shouldComponentUpdate(nextProps, nextState) {
    if (typeof this.props.photos != typeof nextProps.photos) {
      return true;
    }

    if (this.props.photos.length != nextProps.photos.length) {
      return true;
    }

    if (this.state.show_library != nextState.show_library) {
      return true;
    }

    if (this._loading != this._count(nextProps.photos, 'loading')) {
      return true;
    }

    if (this._deleted != this._count(nextProps.photos, 'deleted')) {
      return true;
    }

    return false;
  },

  /**
   *  For shouldComponentUpdate purpose
   */
  _count(photos, prop) {
    var counter = 0;

    for (var photo in photos) {
      if (!photos[photo][prop]) {
        continue;
      }

      ++counter;
    }

    return counter;
  },

  /**
   *  Attach photos
   */
  _onLibrarySelect(photos) {
    this.setState({show_library: false});
    this.props.onAttach(photos);
  },

  /**
   *  Show photo library
   */
  _showPhotoLibrary() {
    this.setState({show_library: true});
  },

  /**
   *  Close photo library
   */
  _closePhotoLibrary() {
    this.setState({show_library: false});
  },

  /**
   *  Make library popup
   */
  _makeLibraryPopup() {
    return (
      <PopupWindow onClose={this._closePhotoLibrary}>
        <PhotoLibrary
          multiple={true}
          onSelect={this._onLibrarySelect}
        />
      </PopupWindow>
    );
  },

  /**
   *  Make insert photo button
   */
  _makeInsertButton() {
    return (
      <div
        key="photo_create"
        className="media-editor__photo media-editor__photo--create"
        onClick={e => {
          this._showPhotoLibrary();
        }}>
        <div className="media-editor__photo-add">+</div>
      </div>
    );
  },

  render() {
    this._loading = this._count(this.props.photos, 'loading');
    this._deleted = this._count(this.props.photos, 'deleted');

    var popup = false;

    if (this.state.show_library) {
      popup = this._makeLibraryPopup();
    }

    var photos = this.props.photos.map(photo => {
      return (
        <Photo
          key={photo.id}
          onSelect={this.props.onSelect}
          onDelete={this.props.onDelete}
          onRestore={this.props.onRestore}
          photo={photo}
        />
      );
    });

    photos.push(this._makeInsertButton());

    return (
      <div className="media-editor__photos">
        {popup}
        {photos}
      </div>
    );
  }
});

module.exports = Photos;