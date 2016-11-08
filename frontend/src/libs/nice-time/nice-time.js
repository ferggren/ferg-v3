/**
 * @file Provides nice time support
 * @name NiceTime
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var Lang = require('libs/lang');

Lang.exportStrings('nice-time', require('./lang/ru.js'), 'ru');
Lang.exportStrings('nice-time', require('./lang/en.js'), 'en');

var NiceTime = {
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

    var ret = NiceTime.niceDateFormat(time);
    ret += ', ' + hours + ':' + minutes;

    return ret;
  },

  /**
   *  Makes nice date string from unix timetamp
   *
   *  @param {number} time Unix timestamp
   *  @return {string} Nice formatted date
   */
  niceDateFormat: function(time) {
    var today = NiceTime._getTodayTime();

    if (time > today) {
      return Lang.get('nice-time.today');
    }

    if ((today - time) < 86400) {
      return Lang.get('nice-time.yesterday');
    }

    var date = new Date(time * 1000);

    var ret = date.getDate();
    ret += ' ';
    ret += Lang.get(
      'nice-time.date_' + NiceTime._month_map[date.getMonth()]
    );

    if ((today - time) > (86400 * 365)) {
      ret += ' ' + date.getFullYear();
    }

    return ret;
  },

  /**
   *  Makes nice month string fron unix timestamp
   *
   *  @param {number} time Unix timestamp
   *  @return {string} Nice formatted month
   */
  niceMonthFormat: function(time) {
    var today = NiceTime._getTodayTime();
    var date  = new Date(time * 1000);

    var ret = Lang.get(
      'nice-time.month_' + NiceTime._month_map[date.getMonth()]
    );
    
    return ret + ' ' + date.getFullYear();
  },

  _month_map: {
    0:  'january',
    1:  'february',
    2:  'march',
    3:  'april',
    4:  'may',
    5:  'june',
    6:  'july',
    7:  'august',
    8:  'september',
    9:  'october',
    10: 'november',
    11: 'december',
  },

  /**
   *  Return today's 00:00 unix timestamp
   *
   *  @return {nuber} Unix timestamp
   */
  _today: false,
  _getTodayTime: function() {
      if (NiceTime._today) {
          return NiceTime._today;
      }

      if (Date.now) {
          NiceTime._today = Date.now();
      }
      else {
          NiceTime._today = new Date().getTime();
      }

      var offset = -(new Date().getTimezoneOffset() * 60);

      NiceTime._today = Math.round(NiceTime._today / 1000);
      NiceTime._today += offset;
      NiceTime._today = NiceTime._today - (NiceTime._today % 86400);
      NiceTime._today -= offset;

      return NiceTime._today;
  },
};

module.exports = NiceTime;