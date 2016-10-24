/**
 * @file Popup Window
 * @name PopupWindow
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React = require('react');
var Popup = require('components/popup');

var PopupWindow = React.createClass({
  render() {
    var title = null;

    if (this.props.title) {
      title = (
        <div className="popup__window-title">
          {this.props.title}
        </div>
      );
    };

    return (
      <Popup onClose={this.props.onClose}>
        <div className="popup__window">
          {title}
          <div className="popup__window-content">
            {this.props.children}
          </div>
        </div>
      </Popup>
    );
  }
});

module.exports = PopupWindow;