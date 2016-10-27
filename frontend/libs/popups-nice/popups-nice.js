/**
 * @file Nice popups
 * @name NicePopups
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var Popups = require('libs/popups');

require('./popups-nice.scss');

var NicePopups = {
  /**
   *  Create nice popup
   *
   *  @param {object} options Options list
   *                    onclose onClose callback
   *                    title Popup title
   *                    content Popup content
   *  @return {object} Popup opject
   */
  createPopup(options) {
    var popup_id = false;

    if (typeof options != 'object') {
      options = {};
    }

    if (typeof options.onclose != 'function') {
      options.onclose = () => {
        Popups.removePopup(popup_id);
      };
    }

    if (typeof options.title != 'string') {
      options.title = '';
    }

    if (typeof options.content != 'object') {
      var wrapper       = document.createElement('div');
      wrapper.innerHTML = options.content;

      options.content = wrapper;
    }

    var popup_window = NicePopups._makePopupWindow(options);
    var popup        = Popups.createPopup(options.onclose);

    popup.node.appendChild(popup_window.window);
    popup_id = popup.id;
    options  = null;

    Popups.updatePopupsSize();

    return {
      id:   popup_id,
      node: popup_window.content,
    };
  },

  /**
   *  Close popup
   *
   *  @param {int} Popup id
   */
  removePopup(popup_id) {
    Popups.removePopup(popup_id);
  },

  /**
   *  Update popups size
   */
  updatePopupsSize() {
    Popups.updatePopupsSize();
  },

  /**
   *  Create Popup window object
   */
  _makePopupWindow(options) {
    var popup_window       = document.createElement('div');
    popup_window.className = 'popup__window';

    if (options.title.length) {
      var window_title       = document.createElement('div');
      window_title.className = 'popup__window-title';
      window_title.innerHTML = options.title;

      popup_window.appendChild(window_title);
    }

    var window_content       = document.createElement('div');
    window_content.className = 'popup__window-content';
    window_content.appendChild(options.content);

    if (!isNaN(window.innerHeight)) {
      window_content.style.maxHeight = (window.innerHeight - 50) + 'px';
    }

    popup_window.appendChild(window_content);

    return {
      window:  popup_window,
      content: window_content,
    };
  }
}

module.exports = NicePopups;