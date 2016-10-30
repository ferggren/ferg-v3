/**
 * @file Site Navigation
 * @name SiteNavigation
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React      = require('react');
var Navigation = require('components/view/navigation');
var Lang       = require('libs/lang');

Lang.exportStrings(
  'site-nav',
  require('./site-navigation.lang-' + Lang.getLang() + '.js')
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
        name:  Lang.get('site-nav.landing'),
        match: /^\/(?:(?:ru|en)\/)?$/,
        align: 'left',
        link:  '/' + Lang.getLang() + '/',
      },
      {
        name:  Lang.get('site-nav.storage'),
        match: /^\/(?:ru|en)\/storage/,
        align: 'left',
        link:  '/' + Lang.getLang() + '/storage/',
      },
    ];

    return (
      <Navigation links={navigation} />
    );
  }
});