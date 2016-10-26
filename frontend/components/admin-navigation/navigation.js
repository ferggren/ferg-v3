/**
 * @file Provides navigation menu for admin panel
 * @name AdminMenu
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React       = require('react');
var Navigation  = require('components/view/navigation');
var Lang        = require('libs/lang');

Lang.exportStrings(
  'nav',
  require('./navigation.lang-' + Lang.getLang() + '.js')
);

module.exports = React.createClass({
  _url:  false,
  _lang: false,

  shouldComponentUpdate(nextProps, nextState) {
    if (this._lang != Lang.getLang()) {
      return true;
    }

    if (this._url != window.location.pathname) {
      return true;
    }

    return false;
  },

  render() {
    this._lang = Lang.getLang();
    this._url  = window.location.pathname;
    
    var navigation = [
      {
        name:  Lang.get('nav.photos'),
        match: /^\/(?:ru|en)\/admin\/photos\//,
        align: 'left',
        link:  '/' + Lang.getLang() + '/admin/photos/',
      },
      {
        name:  Lang.get('nav.notes'),
        match: /^\/(?:ru|en)\/admin\/pages\/notes\//,
        align: 'left',
        link:  '/' + Lang.getLang() + '/admin/pages/notes/',
      },
      {
        name:  Lang.get('nav.moments'),
        match: /^\/(?:ru|en)\/admin\/pages\/moments\//,
        align: 'left',
        link:  '/' + Lang.getLang() + '/admin/pages/moments/',
      },
      {
        name:  Lang.get('nav.portfolio'),
        match: /^\/(?:ru|en)\/admin\/pages\/portfolio\//,
        align: 'left',
        link:  '/' + Lang.getLang() + '/admin/pages/portfolio/',
      },
      {
        name:  Lang.get('nav.storage'),
        match: /^\/(?:ru|en)\/admin\/storage\//,
        align: 'left',
        link:  '/' + Lang.getLang() + '/admin/storage/',
      },
      {
        name:  Lang.get('nav.home'),
        match: /^\$/,
        align: 'right',
        link:  '/',
        smart: false,
      },
    ];

    return (
      <Navigation links={navigation} />
    );
  }
});