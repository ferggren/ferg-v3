/**
 * @file Provides some common functions
 * @name App
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var App = {
    showLoginWindow: function() {
        var wrapper = document.createElement('div');
        wrapper.className = 'popup__oauth';

        var methods = ['vkontakte', 'instagram', 'twitter', 'facebook', 'google'];

        for (var method in methods) {
            method = methods[method];

            var link = document.createElement('a');
            link.href = '/oauth/init/' + method;
            link.className = 'popup__oauth-method'

            var img = document.createElement('img');
            img.src = '/images/oauth/' + method + '.png';

            link.appendChild(img);
            wrapper.appendChild(link);
        }

        Popup.createWindow({
            content: wrapper,
            title: Lang.get('site.menu_signin')
        });
    },

    escape: function(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },
}