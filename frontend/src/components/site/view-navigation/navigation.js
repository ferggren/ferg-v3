/**
 * @file Site Navigation
 * @name SiteNavigation
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React          = require('react');
var { Link }       = require('react-router');
var { connect }    = require('react-redux');
var Lang           = require('libs/lang');
var Request        = require('libs/request');
var { userLogout } = require('redux/actions/user');
var PopupWindow    = require('components/shared/popup-window');

require('./style.scss');
require('styles/partials/floating_clear');

Lang.exportStrings('site-nav', require('./lang/ru.js'), 'ru');
Lang.exportStrings('site-nav', require('./lang/en.js'), 'en');

var SiteNavigation = React.createClass({
  _request: false,

  getInitialState() {
    return {
      signin: false,
    }  
  },

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.lang != nextProps.lang) {
      return true;
    }

    if (this.props.location != nextProps.location) {
      return true;
    }

    if (this.props.user.id != nextProps.user.id) {
      return true;
    }

    if (this.state.signin != nextState.signin) {
      return true;
    }

    return false;
  },

  componentWillUnmount() {
    if (this._request) {
      Request.abort(this._request);
      this._request = false;
    }
  },

  /**
   *  Log out user
   */
  _logout() {
    this._request = Request.fetch(
      '/api/user/logout/', {
        success: () => {
          this._request = false;
          this.props.dispatch(userLogout());
        },

        error: error => {
          console.log(error);
          this._request = false;
        }
      }
    );
  },

  /**
   *  Show login windo
   */
  _showLoginWindow() {
    this.setState({signin: true});
  },

  /**
   *  Hide login window
   */
  _closeLoginWindow() {
    this.setState({signin: false});
  },

  /**
   *  Get navigation
   */
  _getNavigation() {
    var url = this.props.location;
    url = url.replace(/\?.*$/, '');
    
    var navigation = [
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

    var user = this.props.user;

    if (user.groups && user.groups.indexOf('admin') >= 0) {
      navigation.push({
        name:    Lang.get('site-nav.admin'),
        align:   'right',
        link:    '/' + this.props.lang + '/admin/',
        smart:   false,
      });
    }

    if (!user.id || !user.name) {
      navigation.push({
        name:    Lang.get('site-nav.signin'),
        align:   'right',
        link:    '/oauth/init/vk/',
        onclick: this._showLoginWindow,
      });
    }

    if (user.id && user.name) {
      navigation.push({
        name:    user.name,
        align:   'right',
        onclick: this._logout,
      });
    }

    return navigation;
  },

  /**
   *  Make auth popup
   */
  _makeAuthPopup() {
    if (!this.state.signin) return null;

    return (
      <PopupWindow onClose={this._closeLoginWindow} title={Lang.get('site-nav.signin')}>
        <div className="oauth-popup">
          <a
            href="/oauth/init/vkontakte/"
            className="oauth-popup__link oauth-popup__link--vkontakte"
          />

          <div className="floating-clear" />
        </div>
      </PopupWindow>
    );
  },

  /**
   *  Make navigation
   */
  _makeNavigation() {
    return this._getNavigation().map(link => {
      var className = '';
      var smart = link.smart !== false;

      if (link.current) {
        className += ' site-menu__navigation--current ';
      }

      if (link.align == 'right') {
        className += ' site-menu__navigation--right ';
      }

      var props = {

      }

      if (link.link) {
        if (smart) props.to = link.link;
        else props.href = link.link;
      }

      if (link.onclick && typeof link.onclick == 'function') {
        props.onClick = e => {
          e.preventDefault();
          link.onclick();
        }
      }

      if (smart) {
        return (
          <li key={link.name} className={className}>
            <Link {...props}>{link.name}</Link>
          </li>
        );
      }
      else {
        return (
          <li key={link.name} className={className}>
            <a {...props}>{link.name}</a>
          </li>
        );
      }
    });
  },

  render() {
    return (
      <div>
        {this._makeAuthPopup()}
        <div className="site-menu__wrapper">
          <div className="site-menu">
            <ul className="site-menu__navigation">
              {this._makeNavigation()}
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
    user:     state.user,
  }
}

module.exports = connect(mapStateToProps)(SiteNavigation);