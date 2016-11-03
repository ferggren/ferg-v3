/**
 * @file Photo components for PhotoLibrary
 * @name Photo
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React = require('react');
var Lang  = require('libs/lang');

var Photo = React.createClass({
  /** for shouldComponentUpdate use **/
  _loading:  false,
  _deleted:  false,
  _selected: false,

  /** update only when photo is changed **/
  shouldComponentUpdate(nextProps) {
    if (this._loading !== nextProps.photo.loading) {
      return true;
    }

    if (this._deleted !== nextProps.photo.deleted) {
      return true;
    }

    if (this._selected !== nextProps.selected) {
      return true;
    }

    return false;
  },

  render() {
    var photo = this.props.photo;

    this._loading = photo.loading;
    this._selected = this.props.selected;
    this._deleted = photo.deleted;

    var style = {
      backgroundImage: "url('" + photo.preview + "')",
    };

    var select  = null;
    var remove  = null;
    var restore = null;
    var loader  = null;
    var edit    = null;

    // select button
    if (!photo.deleted && this.props.multiselect !== false) {
      if (this.props.selected) {
        select = (
          <div
            className="photolibrary__photo-button photolibrary__photo-button-unselect"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              this.props.onPhotoUnselect(photo);
            }}
          />
        );
      }
      else {
        select = (
          <div
            className="photolibrary__photo-button photolibrary__photo-button-select"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              this.props.onPhotoSelect(photo);
            }}
          />
        );
      }
    }

    // delete / restore buttons
    if (photo.loading) {
      loader = <div className="photolibrary__photo-loader loader-tiny"></div>;
    }
    else {
      if (photo.deleted) {
        restore = (
          <a
            className="photolibrary__photo-restore"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              this.props.onPhotoRestore(photo);
            }}
          >
            {Lang.get('photolibrary.photo_restore')}
          </a>
        );
      }
      else {
        remove = (
          <a
            className="photolibrary__photo-delete"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              this.props.onPhotoDelete(photo);
            }}
          >
            {Lang.get('photolibrary.photo_delete')}
          </a>
        );
      }
    }

    // edit button
    if (!photo.deleted) {
      edit = (
        <a
          className="photolibrary__photo-edit"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            this.props.onPhotoEdit(photo);
          }}
        >
          {Lang.get('photolibrary.photo_edit')}
        </a>
      );
    }

    var class_name = "photolibrary__photo";

    if (photo.deleted) {
      class_name += " photolibrary__photo--deleted";
    }

    return (
      <div className="photolibrary__photo-wrapper">
        <div
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            this.props.onPhotoClick(photo);
          }}
          className={class_name}
          style={style}
        >
          {select}
          {edit}
          {restore}
          {loader}
          {remove}
        </div>
      </div>
    );
  }
});

module.exports = Photo;