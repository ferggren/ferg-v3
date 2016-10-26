/**
 * @file Site navigation
 * @name Navigation
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React    = require('react');
var { Link } = require('react-router');
var Lang     = require('libs/lang');

require('./navigation.scss');
require('styles/partials/floating_clear');

var Navigation = React.createClass({
  _url:  false,
  _lang: false,

  shouldComponentUpdate(nextProps, nextState) {
    if (this._lang != Lang.getLang()) {
      return true;
    }

    if (this._url != window.location.pathname) {
      return true;
    }

    if (this.props.links.length != nextProps.links.length) {
      return true;
    }

    for (var i = 0; i < this.props.links.length; ++i) {
      if (this.props.links[i].name != nextProps.links[i].name) {
        return true;
      }

      if (this.props.links[i].link != nextProps.links[i].link) {
        return true;
      }
    }
    
    return false;
  },

  render() {
    this._url  = window.location.pathname;
    this._lang = Lang.getLang();
    
    var links = this.props.links.map((link) => {
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
  },
});

module.exports = Navigation;