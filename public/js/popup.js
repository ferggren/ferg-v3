/**
 * @file Provide popups upport
 * @name Popup
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

 var Popup = {
    __popups: {},
    __list: [],

    /**
     *  Create a popup window with custom content
     *  Window is placed on top of any other window
     * 
     *  @param {object} content Window content
     *  @param {string} title Optional window title
     *  @param {requestCallback} onclose Callback to be called when window will be closed by user
     *  @return {number} Window id
     */
    createWindow: function(content, title, onclose) {
        if (typeof onclose != 'function') {
            onclose = function() {};
        }

        if (typeof title != 'string') {
            title = '';
        }

        if (typeof content != 'object') {
            var _content = document.createElement('div');
            _content.innerHTML = content;

            content = _content;
        }

        var popup = document.createElement('div');
        popup.className = 'popup__window';

        if (title.length) {
            var window_title = document.createElement('div');
            window_title.className = 'popup__window-title';
            window_title.innerHTML = title;

            popup.appendChild(window_title);
        }

        var window_content = document.createElement('div');
        window_content.className = 'popup__window-content';
        window_content.appendChild(content);

        popup.appendChild(window_content);

        return Popup.createPopup(popup, onclose);
    },

    /**
     *  Closes popup window
     *  If called without arguments, latest window will be closed
     * 
     *  @param {number} window_id Window id
     */
    closeWindow: function(window_id) {
        Popup.closePopup(window_id);
    },

    /**
     *  Create a raw popup with custom content
     * 
     *  @param {object} content Popup content
     *  @param {requestCallback} onclose Callback to be called when window will be closed by user
     *  @return {number} Popup id
     */
    createPopup: function(content, onclose) {
        Popup.__init();
        Popup.__createShadow();

        if (typeof content != 'object') {
            var _content = document.createElement('div');
            _content.innerHTML = content;

            content = _content;
        }

        if (typeof onclose != 'function') {
            onclose = function() {};
        }

        var container = document.createElement('div');
        container.className = 'popup__container';
        container.appendChild(content);

        var popup = {
            id: Popup.__getNextId(),
            container: container,
            onclose: onclose,
        };

        document.body.appendChild(container);

        Popup.__popups[popup.id] = popup;
        Popup.__updatePopups();
        Popup.__resize();

        return popup.id;
    },

    /**
     *  Closes popup
     *  If called without arguments, latest popup will be closed
     * 
     *  @param {number} popup_id Popup id
     */
    closePopup: function(popup_id) {
        if (typeof Popup.__popups[popup_id] != 'undefined') {
            return Popup.__close(popup_id, false)
        }

        var max_id = 0;

        for (var popup_id in Popup.__popups) {
            max_id = Math.max(max_id, popup_id);
        }

        return max_id ? Popup.__close(max_id, false) : false;
    },

    /**
     *  Closes latest popup by user
     *  Triggered when user clicks outside of popup
     */
    __userClose: function() {
        var max_id = 0;

        for (var popup_id in Popup.__popups) {
            max_id = Math.max(max_id, popup_id);
        }

        return max_id ? Popup.__close(max_id, true) : false;
    },

    /**
     *  Closes popup
     *
     *  @param {number} popup_id Popup id
     *  @param {boolean} by_user The way popup closed: by user or from script
     */
    __close: function(popup_id, by_user) {
        if (typeof Popup.__popups[popup_id] == 'undefined') {
            return false;
        }

        var container = Popup.__popups[popup_id].container;

        if (by_user && Popup.__popups[popup_id].onclose) {
            var ret = Popup.__popups[popup_id].onclose();

            if (ret === false) {
                return;
            }
        }

        container.parentNode.removeChild(container);

        delete container;
        delete Popup.__popups[popup_id];

        if (Object.keys(Popup.__popups).length) {
            Popup.__updatePopups();
        }
        else {
            Popup.__closeShadow();
        }
    },

    /**
     *  Creates a shadow layer between document and popup
     *  When user clicks on layer popup will be closed
     */
    __createShadow: function() {
        var shadow = document.getElementById('__popup_shadow');

        if (shadow) {
            return;
        }

        var shadow = document.createElement('div');
        shadow.id = '__popup_shadow';
        shadow.className = 'popup__shadow';
        shadow.style.zIndex = '20000';

        shadow.onclick = function(event) {
            if(event.preventDefault) {
                event.preventDefault();
            }

            if(event.stopPropagation) {
                event.stopPropagation();
            }

            Popup.__userClose();
        }

        document.body.appendChild(shadow);
    },

    /**
     * Removes shadow layer from DOM
     */
    __closeShadow: function() {
        var shadow = document.getElementById('__popup_shadow');

        if (!shadow) {
            return;
        }

        shadow.parentNode.removeChild(shadow);
    },

    /**
     *  Puts the latest popup on top of other popups
     */
    __updatePopups: function() {
        var found = false;
        var max_id = 0;

        for (var popup_id in Popup.__popups) {
            max_id = Math.max(max_id, popup_id);
            Popup.__popups[popup_id].container.style.zIndex = ((10000 + max_id) + '');
        }

        if (max_id) {
            Popup.__popups[max_id].container.style.zIndex = '20001';
        }
    },

    /**
     *  Returns next id for popup
     */
    __getNextId: function() {
        var max_id = 0;

        for (var popup_id in Popup.__popups) {
            max_id = Math.max(popup_id, max_id);
        }

        return max_id + 1;
    },

    /**
     *  Popups initialization
     */
    __init_completed: false,
    __init: function() {
        if (Popup.__init_completed) {
            return;
        }

        Popup.__init_completed = true;

        if (window.addEventListener) {
            window.addEventListener(
                'resize',
                function() {
                    Popup.__resize();
                    return true;
                },
                false
            );
        }

        else if (window.attachEvent) {
            window.attachEvent(
                'resize',
                function() {
                    Popup.__resize();
                    return true;
                }
            );
        }

        setInterval(Popup.__resize, 200);
    },

    /**
     *  Resizes popup to be at the center of the window
     *  Called every 200msec, or when window is resized
     */
    __resize: function() {
        for (var popup_id in Popup.__popups) {
            var container = Popup.__popups[popup_id].container;

            if (!container) {
                Popup.closePopup(popup_id);
                continue;
            }

            var c_h = container.offsetHeight;
            var c_w = container.offsetWidth;

            var w_h = window.innerHeight;
            var w_w = window.innerWidth;

            if (isNaN(w_h)) { w_h = c_h; }
            if (isNaN(w_w)) { w_w = c_w; }

            var offset_x = Math.max(0, ~~((w_w - c_w) / 2));
            var offset_y = Math.max(0, ~~((w_h - c_h) / 2));

            container.style.top = offset_y + 'px';
            container.style.left = offset_x + 'px';
        }
    },
}