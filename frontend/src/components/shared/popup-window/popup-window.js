/**
 * @file Popup Window
 * @name PopupWindow
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React    = require('react');
var ReactDOM = require('react-dom');
var Popups   = require('libs/popups-nice');

var PopupWindow = React.createClass({
  _popup:    false,
  _content:  false,

  /**
   *  Create new popup
   */
  componentDidMount() {
    this._content = document.createElement('div');

    this._popup   = Popups.createPopup({
      content: this._content,
      onclose: this.props.onClose,
      title:   this.props.title,
    });

    this.componentDidUpdate();
  },

  /**
   *  Destroy created popup
   */
  componentWillUnmount() {
    Popups.removePopup(this._popup.id);

    this._popup = false;
  },

  /**
   *  Render component to popup
   */
  componentDidUpdate() {
    ReactDOM.render(
      <div>{this.props.children}</div>,
      this._popup.node
    );

    Popups.updatePopupsSize();
  },

  render() {
    return null;
  }
});

module.exports = PopupWindow;