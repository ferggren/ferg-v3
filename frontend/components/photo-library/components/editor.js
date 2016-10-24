/**
 * @file PhotoEditor components for PhotoLibrary
 * @name PhotoEditor
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React       = require('react');
var Lang        = require('libs/lang');
var TagsCloud   = require('components/tags-cloud');
var PopupWindow = require('components/popup-window');

var PhotoEditor = React.createClass({
  render() {
    var photo = this.props.photo;

    return (
      <PopupWindow onClose={this.props.onClose}>

        <div className="photolibrary__editor-wrapper">
          <div
            className="photolibrary__editor-cover"
            style={{
              backgroundImage: "url('" + photo.preview + "')",
            }}
          ></div>
          Blah blah blah
        </div>
        
      </PopupWindow>
    );
  }
});

module.exports = PhotoEditor;