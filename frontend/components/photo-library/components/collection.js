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
  getInitialState() {
    return {
      editor: !!this.props.editor,
    }
  },

  shouldComponentUpdate(nextProps) {
    return true;
  },

  render() {
    var abort   = null;
    var form    = null;
    var title   = null;
    var edit    = null;
    var remove  = null;
    var restore = null;
    var loader  = null;

    var collection = this.props.collection;

    // collection title
    if (!collection.edit_mode && collection.title) {
      title = (
        <div className="photolibrary__collection-title-wrapper">
          <div className="photolibrary__collection-title">
            {collection.title}
          </div>
        </div>
      );
    }

    // edit button
    if (collection.editable && !collection.edit_mode) {
      edit = (
        <a
          className="photolibrary__collection-edit"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {Lang.get('photolibrary.collection_edit')}
        </a>
      );
    }

    if (collection.edit_mode) {
      abort = (
        <a
          className="photolibrary__collection-abort"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {Lang.get('photolibrary.collection_abort')}
        </a>
      );
    }

    // delete / restore buttons
    if (collection.id && !collection.edit_mode) {
      if (collection.loading) {
        loader = <div className="photolibrary__collection-loader loader-tiny"></div>;
      }
      else {
        if (collection.deleted) {
          restore = (
            <a
              className="photolibrary__collection-restore"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
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
              }}
            >
              {Lang.get('photolibrary.collection_delete')}
            </a>
          );
        }
      }
    }

    return (
      <div className="photolibrary__collection-wrapper">
        <div
          className="photolibrary__collection"
          onClick={this.props.onSelect}
        >
          {title}
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