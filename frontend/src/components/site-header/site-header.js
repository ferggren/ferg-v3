/**
 * @file Site Header
 * @name SiteHeader
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React = require('react');

require('./style.scss');
require('styles/partials/floating_clear');

var SiteHeader = React.createClass({
  shouldComponentUpdate(nextProps, nextState) {
    return false;
  },

  render() {
    return (
      <div className="site-header">
        <div className="site-header__contacts-wrapper">
          <div className="site-header__contacts">
            <a
              href="mailto:me@ferg.in"
              className="site-header__contact site-header__contact--mail"
            />

            <a
              target="_blank"
              rel="nofollow noopener noreferrer"
              href="https://github.com/ferggren" 
              className="site-header__contact site-header__contact--github"
            />

            <a
              href="skype:ferggren?chat"
              className="site-header__contact site-header__contact--skype"
            />

            <a
              target="_blank"
              rel="nofollow noopener noreferrer"
              href="https://instagram.com/ferggren/"
              className="site-header__contact site-header__contact--instagram"
            />

            <a
              target="_blank"
              rel="nofollow noopener noreferrer"
              href="https://telegram.me/ferggren"
              className="site-header__contact site-header__contact--telegram"
            />

            <a
              target="_blank"
              rel="nofollow noopener noreferrer"
              href="https://vk.com/id4867738"
              className="site-header__contact site-header__contact--vk"
            />

            <a
              target="_blank"
              rel="nofollow noopener noreferrer"
              href="https://www.facebook.com/ferggren"
              className="site-header__contact site-header__contact--facebook"
            />

            <a
              target="_blank"
              rel="nofollow noopener noreferrer"
              href="https://steamcommunity.com/id/ferggren/"
              className="site-header__contact site-header__contact--steam"
            />

            <div className="floating-clear" />
          </div>
        </div>
      </div>
    );
  }
});

module.exports = SiteHeader;