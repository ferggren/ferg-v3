/**
 * @file Popup
 * @name Popup
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React    = require('react');
var ReactDOM = require('react-dom');

var Popups = {
  _popups: {},

  /**
   *  Create and return new popup
   */
  _createPopup(onclose) {
    if (!Object.keys(Popups._popups).length) {
      Popups._createShadow();
    }

    var popup_id   = Popups._makeNextPopupId();
    var popup_node = Popups._makePopupNode();

    Popups._popups[popup_id] = {
      id:    popup_id,
      node:  popup_node,
      close: onclose,
    };

    Popups._updatePopupZ();
    Popups._initWatch();
    Popups._watchResize();

    return Popups._popups[popup_id];
  },

  /**
   *  Destroy popup
   */
  _removePopup(popup_id) {
    var popup = Popups._popups[popup_id];

    if (!popup) {
      return;
    }

    popup.node.parentNode.removeChild(popup.node);
    popup.node = null;

    Popups._popups[popup_id] = null;

    delete Popups._popups[popup_id];

    if (!Object.keys(Popups._popups).length) {
      Popups._closeShadow();
    }

    popup = null;

    Popups._updatePopupZ();
  },

    /**
   *  Make next popup ID
   */
  _makeNextPopupId() {
    var max_id = 0;

    for (var popup_id in Popups._popups) {
      max_id = Math.max(max_id, popup_id);
    }

    return ++max_id;
  },

  /**
   *  Make popup node
   */
  _makePopupNode() {
    var popup = document.createElement('div');
    popup.style.position = 'fixed';

    document.body.appendChild(popup);

    return popup;
  },

  /**
   *  Make shadow
   */
  _createShadow() {
    if (document.getElementById('__popup_shadow')) {
      return;
    }

    var shadow = document.createElement('div');

    shadow.style.background = '#666';
    shadow.style.background = 'rgba(0, 0, 0, .3)';
    shadow.style.position   = 'fixed';
    shadow.style.top        = '0px'
    shadow.style.left       = '0px';
    shadow.style.width      = '100%';
    shadow.style.height     = '100%';
    shadow.style.zIndex     = '20000';

    shadow.id = '__popup_shadow';

    shadow.onclick = e => {
      e.preventDefault();
      e.stopPropagation();

      Popups._closeTopPopup();
    }

    document.body.appendChild(shadow);
    document.body.style.overflow = 'hidden';
  },

  /**
   *  Close shadow
   */
  _closeShadow() {
    var shadow = document.getElementById('__popup_shadow');

    if (!shadow) {
      return;
    }

    shadow.parentNode.removeChild(shadow);
    document.body.style.overflow = 'scroll';
  },

  /**
   *  Close popup at the top
   */
  _closeTopPopup() {
    var max_id = 0;

    for (var popup_id in Popups._popups) {
      max_id = Math.max(popup_id, max_id);
    }

    if (!max_id) {
      return;
    }

    if (typeof Popups._popups[max_id].close != 'function') {
      return;
    }

    Popups._popups[max_id].close();
  },

  /**
   *  Update popups Z-index
   */
  _updatePopupZ() {
    if (!Object.keys(Popups._popups).length) {
      return;
    }

    var max_id = 0;

    for (var popup_id in Popups._popups) {
      Popups._popups[popup_id].node.style.style = ((10000 + popup_id) + '');
      max_id = Math.max(popup_id, max_id);
    }
    
    Popups._popups[max_id].node.style.style = '20001';
  },

  _init: false,
  _initWatch() {
    if (Popups._init) {
      return;
    }

    Popup._init = true;

    if (!window || !window.addEventListener) {
      return;
    }

    window.addEventListener(
      'resize',
      () => { Popups._watchResize(); return true; },
      false
    );

    setInterval(Popups._watchResize, 200);
  },

  /**
   *  Resize on container/window size changed
   */
  _watchResize() {
    for (var popup_id in Popups._popups) {
      var node = Popups._popups[popup_id].node;

      if (!node) {
        continue;
      }

      var c_h = node.offsetHeight;
      var c_w = node.offsetWidth;

      var w_h = window.innerHeight;
      var w_w = window.innerWidth;

      if (isNaN(w_h)) { w_h = c_h; }
      if (isNaN(w_w)) { w_w = c_w; }

      var offset_x = Math.max(0, ~~((w_w - c_w) / 2));
      var offset_y = Math.max(0, ~~((w_h - c_h) / 2));

      node.style.top = offset_y + 'px';
      node.style.left = offset_x + 'px';
    }
  },
}

var Popup = React.createClass({
  _popup:    false,
  _popup_id: false,

  /**
   *  Create new popup
   */
  componentDidMount() {
    this._popup    = Popups._createPopup(this.props.onClose);
    this._popup_id = this._popup.id;
    this.componentDidUpdate();
  },

  /**
   *  Destroy created popup
   */
  componentWillUnmount() {
    Popups._removePopup(this._popup_id);

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
  },

  render() {
    return null;
  }
});

module.exports = Popup;