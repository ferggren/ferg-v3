/**
 * @file Popup
 * @name Popup
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React    = require('react');
var ReactDOM = require('react-dom');
var Popups   = require('libs/popups');

var Popup = React.createClass({
  _popup:    false,
  _popup_id: false,

  /**
   *  Create new popup
   */
  componentDidMount() {
    this._popup    = Popups.createPopup(this.props.onClose);
    this._popup_id = this._popup.id;
    this.componentDidUpdate();
  },

  /**
   *  Destroy created popup
   */
  componentWillUnmount() {
    Popups.removePopup(this._popup_id);

    this._popup_id = false;
    this._popup    = false;
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

module.exports = Popup;