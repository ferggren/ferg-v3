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
      expanded: false,
    }
  },

  _expand() {
    this.setState({expanded: true});
  },

  _collapse() {
    this.setState({expanded: false});
  },

  _makeCollection(collection) {
    return (
      <Collection
        key={collection.id}
        collection={collection}
        onCollectionSelect={this.props.onCollectionSelect}
        onCollectionEdit={this.props.onCollectionEdit}
        onCollectionEditCancel={this.props.onCollectionEditCancel}
        onCollectionUpdate={this.props.onCollectionUpdate}
        onCollectionDelete={this.props.onCollectionDelete}
        onCollectionRestore={this.props.onCollectionRestore}
      />
    );
    return null;
  },

  render() {
    var collections  = [];
    var show_all     = null;
    var hide_all     = null;
    var hidden_count = 0;

    this.props.collections.forEach(collection => {
      if (this.props.default_collections.indexOf(collection.id) >= 0) {
        collections.unshift(this._makeCollection(collection));
        return;
      }

      ++hidden_count;

      if (!this.state.expanded) {
        return;
      }
      
      collections.push(this._makeCollection(collection));
    });

    if (!this.state.expanded && hidden_count) {
      show_all = (
        <div
          className="photolibrary__collections-expand"
          onClick={this._expand}
        >
          {Lang.get('photolibrary.collections_expand')}
        </div>
      );
    }

    if (this.state.expanded) {
      hide_all = (
        <div
          className="photolibrary__collections-collapse"
          onClick={this._collapse}
        >
          {Lang.get('photolibrary.collections_collapse')}
        </div>
      );
    }

    return (
      <div className="photolibrary__collections-wrapper">
        {collections}
        <div className="photolibrary__collections-clear" />
        {show_all}
        {hide_all}
      </div>
    );
  }
});

module.exports = Collections;