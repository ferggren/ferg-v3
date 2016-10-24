/**
 * @file Collection components for PhotoLibrary
 * @name Collection
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React = require('react');
var Lang  = require('libs/lang');

require('styles/partials/loader');

var Collection = React.createClass({
  /** for shouldComponentUpdate use **/
  _loading: false,
  _editing: false,
  _deleted: false,
  _name:    false,
  _cover:   false,
  _photos:  false,

  /** update only when collection is changed **/
  shouldComponentUpdate(nextProps) {
    if (this._loading != nextProps.collection.loading) {
      return true;
    }
    
    if (this._editing != nextProps.collection.editing) {
      return true;
    }
    
    if (this._deleted != nextProps.collection.deleted) {
      return true;
    }
    
    if (this._name != nextProps.collection.name) {
      return true;
    }
    
    if (this._cover != nextProps.collection.cover) {
      return true;
    }
    
    if (this._photos != nextProps.collection.photos) {
      return true;
    }
    
    return false;
  },

  render() {
    var abort   = null;
    var form    = null;
    var name    = null;
    var edit    = null;
    var remove  = null;
    var restore = null;
    var loader  = null;
    var photos  = null;

    var collection = this.props.collection;

    this._loading = collection.loading;
    this._editing = collection.editing;
    this._deleted = collection.deleted;
    this._name    = collection.name;
    this._cover   = collection.cover;
    this._photos  = collection.photos;

    // photos amount
    if (!collection.editing && parseInt(collection.photos) > 0) {
      photos = (
        <div className="photolibrary__collection-photos">
          {collection.photos}
        </div>
      );
    }

    // collection name
    if (!collection.editing && collection.name) {
      name = (
        <div className="photolibrary__collection-name-wrapper">
          <div className="photolibrary__collection-name">
            {collection.name}
          </div>
        </div>
      );
    }

    // edit button
    if (parseInt(collection.id) > 0 && !collection.editing && !collection.loading) {
      edit = (
        <a
          className="photolibrary__collection-edit"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            this.props.onCollectionEdit(collection);
          }}
        >
          {Lang.get('photolibrary.collection_edit')}
        </a>
      );
    }

    // abort button
    if (collection.editing && !collection.loading) {
      abort = (
        <a
          className="photolibrary__collection-abort"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            this.props.onCollectionEditCancel(collection);
          }}
        >
          {Lang.get('photolibrary.collection_abort')}
        </a>
      );
    }

    // editing form
    if (collection.editing) {
      var disabled = collection.loading ? {disabled: true} : {};
      form = (
        <form
          className="photolibrary__collection-editor"
          onSubmit={e => {
            e.preventDefault();
            e.stopPropagation();
            this.props.onCollectionUpdate(
              collection,
              this.refs.collection_name.value
            );
          }}
        >
          <input
            type="text"
            ref="collection_name"
            defaultValue={collection.name_edit}
            {...disabled}
          />
        </form>
      );
    }

    // loader
    if (collection.loading) {
      loader = <div className="photolibrary__collection-loader loader-tiny"></div>;
    }

    // delete / restore buttons
    if (parseInt(collection.id) > 0 && !collection.editing && !collection.loading) {
      if (collection.deleted) {
        restore = (
          <a
            className="photolibrary__collection-restore"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              this.props.onCollectionRestore(collection);
            }}
          >
            {Lang.get('photolibrary.collection_restore')}
          </a>
        );
      }
      else {
        remove = (
          <a
            className="photolibrary__collection-delete"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              this.props.onCollectionDelete(collection);
            }}
          >
            {Lang.get('photolibrary.collection_delete')}
          </a>
        );
      }
    }

    var class_name = "photolibrary__collection";

    if (collection.deleted) {
      class_name += " photolibrary__collection--deleted";
    }

    var style = {

    };

    if (collection.cover) {
      style.backgroundImage = "url('" + collection.cover + "')";
    }

    return (
      <div className="photolibrary__collection-wrapper">
        <div
          className={class_name}
          onClick={e => {
            if (!collection.editing) {
              this.props.onCollectionSelect(collection);
            }
          }}
          style={style}
        >
          {photos}
          {name}
          {form}
          {abort}
          {edit}
          {remove}
          {restore}
          {loader}
        </div>
      </div>
    );
  }
});

module.exports = Collection;