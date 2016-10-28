/**
 * @file Photo Component for Photos
 * @name Photo
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React = require('react');
var Lang   = require('libs/lang');

var Photo = React.createClass({
  _loading: false,
  _deleted: false,

  getInitialState() {
    return {
      show_library: false,
    }
  },

  shouldComponentUpdate(nextProps, nextState) {
    if (this._loading != nextProps.photo.loading) {
      return true;
    }

    if (this._deleted != nextProps.photo.deleted) {
      return true;
    }

    return false;
  },

  render() {
    var photo = this.props.photo;

    this._deleted = photo.deleted;
    this._loading = photo.loading;

    var remove  = null;
    var restore = null;
    var loader  = null;

    // loading
    if (photo.loading) {
      loader = <div className="media-editor__photo-loader loader-tiny" />
    }

    // restore
    if (!photo.loading && photo.deleted) {
      restore = (
        <div
          className="media-editor__photo-button media-editor__photo-button--restore"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();

            this.props.onRestore(photo);
          }}>
          {Lang.get('media-editor.photo_restore')}
        </div>
      );
    }

    // delete
    if (!photo.loading && !photo.deleted) {
      remove = (
        <div
          className="media-editor__photo-button media-editor__photo-button--delete"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();

            this.props.onDelete(photo);
          }}>
          {Lang.get('media-editor.photo_delete')}
        </div>
      );
    }

    return (
      <div
        className="media-editor__photo"
        style={{backgroundImage: "url('" + photo.preview +"')"}}
        onClick={e => {
          this.props.onSelect(photo.id);
        }}>
        <div className="media-editor__photo-button media-editor__photo-button--title">
          {photo.name}
        </div>
        {remove}
        {restore}
        {loader}
      </div>
    );
  }
});

module.exports = Photo;