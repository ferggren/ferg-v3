/**
 * @file Collections components for PhotoLibrary
 * @name Collections
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React      = require('react');
var Lang       = require('libs/lang');
var Collection = require('./collection.js');

require('styles/partials/floating_clear');
require('styles/partials/loader');

var Collections = React.createClass({
  getInitialState() {
    return {
      expand: false,
      editor: false,
    }
  },

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.expand != this.state.expand) {
      return true;
    }

    return true;
  },

  _showNewCollectionForm() {
    console.log('a');
    this.setState({editor: true});
  },

  _hideNewCollectionForm() {
    this.setState({editor: true});
  },

  _addNewCollection(collection_name) {
    console.log(collection_name);
    // this.setState({editor: false});
  },

  render() {
    var collections = [];

    if (this.state.expand) {
      collections = this.state.collections.map(collection => {
        console.log(collection);

        return null;
      });
    }

    if (!this.state.editor) {
      collections.unshift(
        <Collection
          key="album_create"
          onSelect={() => {this._showNewCollectionForm()}}
          collection={{
            title:     "Добавить альбом",
            editable:  false,
            id:        false,
            edit_mode: false,
          }}
        />
      );
    }
    else {
      collections.unshift(
        <Collection
          key="album_editor"
          onEdit={title => { this._addNewCollection(title)}}
          onEditCancel={() => {this._hideNewCollectionForm();}}
          collection={{
            title:     "",
            editable:  false,
            id:        false,
            edit_mode: true,
          }}
        />
      );
    }

    collections.unshift(
      <Collection
        key="photos_all"
        onSelect={() => {this.props.onCollectionSelect(0)}}
        collection={{
          title:     "Все фотографии",
          editable:  false,
          id:        false,
          edit_mode: false,
        }}
      />
    );

    return (
      <div
        className="photolibrary__collections-wrapper"
      >
        {collections}
        <div className="floating-clear" />
      </div>
    );
  }
});

module.exports = Collections;