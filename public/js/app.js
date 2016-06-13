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

    /**
     *  Escapes html stuff from string
     *
     *  @param {string} str String needed to be escaped
     *  @return {string} Escaped string
     */
    escape: function(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    /**
     *  Makes nice date & time string from unix timetamp
     *
     *  @param {number} time Unix timestamp
     *  @return {string} Nice formatted date & time
     */
    niceTimeFormat: function(time) {
        var date = new Date(time * 1000);

        var hours = date.getHours();
        if (hours < 10) hours = '0' + hours;

        var minutes = date.getMinutes();
        if (minutes < 10) minutes = '0' + minutes;

        var ret = App.niceDateFormat(time);
        ret += ', ' + hours + ':' + minutes;

        return ret;
    },

    __month_map: {
        0: 'january',
        1: 'february',
        2: 'march',
        3: 'april',
        4: 'may',
        5: 'june',
        6: 'july',
        7: 'august',
        8: 'september',
        9: 'october',
        10: 'november',
        11: 'december',
    },

    /**
     *  Makes nice date string from unix timetamp
     *
     *  @param {number} time Unix timestamp
     *  @return {string} Nice formatted date
     */
    niceDateFormat: function(time) {
        var today = App.__getTodayTime();

        if (time > today) {
            return Lang.get('time.today');
        }

        if ((today - time) < 86400) {
            return Lang.get('time.yesterday');
        }

        var date = new Date(time * 1000);

        var ret = date.getDate();
        ret += ' ';
        ret += Lang.get('time.' + App.__month_map[date.getMonth()]);

        if ((today - time) > (86400 * 365)) {
            ret += ' ' + date.getFullYear();
        }

        return ret;
    },

    /**
     *  Return today's 00:00 unix timestamp
     *
     *  @return {nuber} Unix timestamp
     */
    __today: false,
    __getTodayTime: function() {
        if (App.__today) {
            return App.__today;
        }

        if (Date.now) {
            App.__today = Date.now();
        }
        else {
            App.__today = new Date().getTime();
        }

        var offset = -(new Date().getTimezoneOffset() * 60);

        App.__today = Math.round(App.__today / 1000);
        App.__today += offset;
        App.__today = App.__today - (App.__today % 86400);
        App.__today -= offset;

        return App.__today;
    },
}