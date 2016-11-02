/**
 * @file Provides lang support
 * @name Lang
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

 var Lang = {
  /** Current lang */
  lang: false,

  /** Default lang */
  default_lang: 'en',

  /** Strings list */
  strings: {},

  /**
   *  Find associated to a string_id string, replace variables and return it
   *
   *  @param {string} string_id String id ($prefix.$id)
   *  @param {object} variables List of variables (name: value)
   *  @return {string} Processed string associated to string_id
   */
  get(string_id, variables) {
    if (typeof string_id != 'string') {
      return false;
    }

    if (typeof variables != 'object') {
      variables = {};
    }

    var prefix = Lang.getLang();
    var pos = string_id.indexOf('.');

    if (pos > 0) {
      prefix += '-' + string_id.substring(0, pos);
      string_id = string_id.substring(pos + 1);
    }

    if (typeof Lang.strings[prefix] != 'object') {
      return string_id;
    }

    if (typeof Lang.strings[prefix][string_id] != 'string') {
      return string_id;
    }

    var string = Lang.strings[prefix][string_id];

    if (!Object.keys(variables).length) {
      return string;
    }

    return Lang._processString(string, variables);
  },

  /**
   *  Return current lang
   *
   *  @return {string} Current lang
   */
  getLang() {
    if (Lang.lang) {
      return Lang.lang;
    }

    Lang._init();
    return Lang.lang;
  },

  /**
   *  Changes current lang
   *
   *  @param {string} New lang 
   *  @return {boolean} Result of operation
   */
  setLang(lang) {
    if (typeof lang != 'string') {
      return false;
    }

    if (!lang.match(/^[a-zA-Z0-9_-]{1,8}$/g)) {
      return false;
    }
    
    Lang.lang = lang;
    return true;
  },

  /**
   *  Export strings list info specified prefix
   *
   *  @param {strings} prefix Strings prefix
   *  @param {object} strings Strings list
   *  @param {string} strings Strings lang
   *  @return {boolean} Result of operation
   */
  exportStrings(prefix, strings, lang) {
    if (typeof prefix != 'string') {
      return false;
    }

    if (typeof strings != 'object') {
      return false;
    }

    var key = lang || Lang.getLang();

    if (prefix.length) {
      key += '-' + prefix;
    }

    if (typeof Lang.strings[key] == 'undefined') {
      Lang.strings[key] = strings;
      return true;
    }

    for (var string in strings) {
      Lang.strings[key][string] = strings[string];
    }

    return true;
  },

  /**
   *  Process string – replace variables & pluralize
   *
   *  @param {string} string Input string
   *  @param {object} replacements List of replacements (name: value)
   *  @return {string} Processed string
   */
  _processString(string, replacements) {
    if (typeof replacements != 'object') {
      replacements = {};
    }

    for (var key in replacements) {
      var regexp = new RegExp(Lang._escapeRegexp('%'+key+'%'), 'g');
      string = string.replace(regexp, replacements[key]);
    }

    if (string.indexOf('rupluralize') >= 0) {
      string = Lang._processRupluralize(string);
    }

    if (string.indexOf('pluralize') >= 0) {
      string = Lang._processPluralize(string);
    }

    return string;
  },

  /**
   *  Find and process all 'rupluralize' in the string
   *
   *  @param {string} Raw string 
   *  @return {string} Processed string
   */
  _processRupluralize(string) {
    var regexp = /rupluralize\((\d+(?:\.\d+)?)\s+['\"]([^'\"]+)['\"]\s+['\"]([^'\"]+)['\"]\s+['\"]([^'\"]+)['\"]\)/g;
    var match;
    
    while((match = regexp.exec(string)) !== null) {
      string = string.replace(
        new RegExp(Lang._escapeRegexp(match[0]), 'g'),
        Lang._rupluralize(match[1], match[2], match[3], match[4])
      );

      regexp.lastIndex = 0;
    }

    return string;
  },


  /**
   *  Return correct russian word form for specified number
   *
   *  @param {number} amount 
   *  @param {string} first Word form for first form (один тест)
   *  @param {string} second  Word form for second form (два теста)
   *  @param {string} third  Word form for second form (пять тестов)
   *  @return {string} Correct word form for number
   */
  _rupluralize: function(amount, first, second, third) {
    amount %= 100;

    if (amount >= 10 && amount <= 20) {
      return third;
    }

    amount %= 10;

    if (amount == 1) {
      return first;
    }

    if (amount > 1 && amount < 5) {
      return second;
    }

    return third;
  },


  /**
   *  Find and process all 'pluralize' in the string
   *
   *  @param {string} Raw string 
   *  @return {string} Processed string
   */
  _processPluralize(string) {
    var regexp = /pluralize\((\d+(?:\.\d+)?)\s+['\"]([^'\"]+)['\"]\s+['\"]([^'\"]+)['\"]\)/g;
    var match;
    
    while((match = regexp.exec(string)) !== null) {
      string = string.replace(
        new RegExp(Lang._escapeRegexp(match[0]), 'g'),
        Lang._pluralize(match[1], match[2], match[3])
      );

      regexp.lastIndex = 0;
    }

    return string;
  },

  /**
   *  Return correct word form for specified number
   *
   *  @param {number} amount 
   *  @param {string} one Word form for single amount
   *  @param {string} many Word form for plural amount
   *  @return {string} Correct word form for number
   */
  _pluralize: function(amount, one, many) {
    return amount == 1 ? one : many;
  },

  /**
   *  Escape regexp special symbols in string
   *
   *  @param {string} string Escaping string
   *  @return {string} Regexp-ready string
   */
  _escapeRegexp: function(string) {
    return string.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  },

  /**
   *  Initialize current lang
   */
  _init() {
    if (typeof window != 'undefined' &&
        typeof window.__CURRENT_LANG != 'undefined' &&
        Lang.setLang(window.__CURRENT_LANG)
      ) {
      return;
    }

    if (Lang.setLang(Lang.default_lang)) {
      return;
    }

    Lang.lang = '';
  },
}

module.exports = Lang;