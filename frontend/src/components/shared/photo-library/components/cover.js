/**
 * @file Cover components for PhotoLibrary
 * @name Cover
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React = require('react');
var Lang  = require('libs/lang');

var Cover = React.createClass({
  /** for shouldComponentUpdate use **/
  _cover:   false,
  _photos:  false,

  /** update only when collection is changed **/
  shouldComponentUpdate(nextProps) {
    if (this._cover != nextProps.collection.cover) {
      return true;
    }
    
    if (this._photos != nextProps.collection.photos) {
      return true;
    }
    
    return false;
  },
  render() {
    var photos = null;

    var collection = this.props.collection;

    this._cover = collection.cover;
    this._photos = collection.photos;

    if (parseInt(collection.photos) > 0) {
      photos = (
        <div className="photolibrary__cover-photos">
          {collection.photos}
        </div>
      );
    }

    var style = {

    };

    if (collection.cover) {
      style.backgroundImage = "url('" + collection.cover + "')";
    }

    return (
      <div className="photolibrary__cover-wrapper">
        <div className="photolibrary__cover" style={style}>
          <a
            className="photolibrary__cover-back"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              this.props.onBack();
            }}
          >
            {Lang.get('photolibrary.collections_back')}
          </a>

          <div className="photolibrary__cover-name-wrapper">
            <div className="photolibrary__cover-name">
              {collection.name}
            </div>
          </div>

          {photos}

        </div>
      </div>
    );
  }
});

module.exports = Cover;