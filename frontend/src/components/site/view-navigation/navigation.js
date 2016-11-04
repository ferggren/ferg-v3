/**
 * @file Site Navigation
 * @name SiteNavigation
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React       = require('react');
var Lang        = require('libs/lang');
var { Link }    = require('react-router');
var { connect } = require('react-redux');

require('./style.scss');
require('styles/partials/floating_clear');

Lang.exportStrings('site-nav', require('./lang/ru.js'), 'ru');
Lang.exportStrings('site-nav', require('./lang/en.js'), 'en');

var SiteNavigation = React.createClass({
  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.lang != nextProps.lang) {
      return true;
    }

    if (this.props.location != nextProps.location) {
      return true;
    }

    return false;
  },

  _getNavigation() {
    var url = this.props.location;
    url = url.replace(/\?.*$/, '');
    
    return [
      {
        name:    Lang.get('site-nav.landing'),
        current: url.match(/^\/(?:(?:ru|en)\/)?$/),
        align:   'left',
        link:    '/' + this.props.lang + '/',
      },
      {
        name:    Lang.get('site-nav.gallery'),
        current: url.match(/^\/(?:ru|en)\/gallery/),
        align:   'left',
        link:    '/' + this.props.lang + '/gallery/',
      },
      {
        name:    Lang.get('site-nav.blog'),
        current: url.match(/^\/(?:ru|en)\/blog/),
        align:   'left',
        link:    '/' + this.props.lang + '/blog/',
      },
      {
        name:    Lang.get('site-nav.events'),
        current: url.match(/^\/(?:ru|en)\/events/),
        align:   'left',
        link:    '/' + this.props.lang + '/events/',
      },
      {
        name:    Lang.get('site-nav.dev'),
        current: url.match(/^\/(?:ru|en)\/dev/),
        align:   'left',
        link:    '/' + this.props.lang + '/dev/',
      },
      {
        name:    Lang.get('site-nav.storage'),
        current: url.match(/^\/(?:ru|en)\/storage/),
        align:   'left',
        link:    '/' + this.props.lang + '/storage/',
      },
    ];
  },

  render() {
    Lang.setLang(this.props.lang);
    
    var links = this._getNavigation().map((link) => {
      var className = '';

      if (link.current) {
        className += ' site-menu__navigation--current ';
      }

      if (link.align == 'right') {
        className += ' site-menu__navigation--right ';
      }
      
      return (
        <li key={link.name} className={className}>
          <Link to={link.link}>{link.name}</Link>
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

function mapStateToProps(state) {
  return {
    lang:     state.lang,
    location: state.location,
  }
}

module.exports = connect(mapStateToProps)(SiteNavigation);