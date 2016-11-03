/**
 * @file ButtonAttach component for PhotoLibrary
 * @name ButtonAttach
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React = require('react');
var Lang  = require('libs/lang');

var ButtonAttach = React.createClass({
  _selected: 0,

  /** update only when selected amount is changed **/
  shouldComponentUpdate(nextProps) {
    if (Object.keys(nextProps.selected).length != this._selected) {
      return true;
    }

    return false;
  },

  render() {
    var selected = Object.keys(this.props.selected).length;
    this._selected = selected;

    if (!selected) {
      return false;
    }

    return (
      <div className="photolibrary__selector">
        <div
          className="photolibrary__selector-abort"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            this.props.onAbort();
          }}
        >
          {Lang.get('photolibrary.selected_photos_abort')}
        </div>

        <div
          className="photolibrary__selector-attach"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            this.props.onAttach();
          }}
        >
          {Lang.get('photolibrary.selected_photos_attach', {selected})}
        </div>
      </div>
    );
  }
});

module.exports = ButtonAttach;