/**
 * @file Provides navigation menu for admin panel
 * @name AdminMenu
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React    = require('react');
var Lang     = require('libs/lang');
var { Link } = require('react-router');

require('./style.scss');

Lang.exportStrings('nav', require('./lang/ru.js'), 'ru');
Lang.exportStrings('nav', require('./lang/en.js'), 'en');

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

  _getNavigation() {
    return [
      {
        name:  Lang.get('nav.photos'),
        match: /^\/(?:ru|en)\/admin\/photos\//,
        align: 'left',
        link:  '/' + Lang.getLang() + '/admin/photos/',
      },
      {
        name:  Lang.get('nav.blog'),
        match: /^\/(?:ru|en)\/admin\/pages\/blog\//,
        align: 'left',
        link:  '/' + Lang.getLang() + '/admin/pages/blog/',
      },
      {
        name:  Lang.get('nav.events'),
        match: /^\/(?:ru|en)\/admin\/pages\/events\//,
        align: 'left',
        link:  '/' + Lang.getLang() + '/admin/pages/events/',
      },
      {
        name:  Lang.get('nav.dev'),
        match: /^\/(?:ru|en)\/admin\/pages\/dev\//,
        align: 'left',
        link:  '/' + Lang.getLang() + '/admin/pages/dev/',
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
  },

  render() {
    this._lang = Lang.getLang();
    this._url  = window.location.pathname;

    var links = this._getNavigation().map(link => {
      var className = '';

      if (this._url.match(link.match)) {
        className += ' site-menu__navigation--current ';
      }

      if (link.align == 'right') {
        className += ' site-menu__navigation--right ';
      }

      var node = null;

      if (link.smart === false) {
        node = <a href={link.link}>{link.name}</a>
      }
      else {
        node = <Link to={link.link}>{link.name}</Link>
      }
      
      return (
        <li key={link.name} className={className}>
          {node}
        </li>
      );
    });

    return (
      <div>
        <div className="site-menu__wrapper">
          <div className="site-menu">
            <ul className="site-menu__navigation">
              {links}
            </ul>

            <div className="floating-clear" />
          </div>
        </div>
        
        <div className="site-menu__fixed-placeholder"></div>
      </div>
    )
  }
});