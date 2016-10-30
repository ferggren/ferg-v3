/**
 * @file Site Storage
 * @name SiteStorage
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React          = require('react');
var ContentWrapper = require('components/view/content-wrapper');

require('./site-landing.scss');
require('styles/partials/floating_clear');
require('styles/partials/loader');

var SiteLanding = React.createClass({
  render() {
    return (
      <div>
        <div className="site-header">
          <div className="site-header__contacts-wrapper">
            <div className="site-header__contacts">
              <a href="mailto:me@ferg.in">
                <img src={require('./media/contacts/mail.png')} />
              </a>

              <a target="_blank" rel="nofollow noopener noreferrer" href="https://github.com/ferggren">
                <img src={require('./media/contacts/github.png')} />
              </a>

              <a href="skype:ferggren?chat">
                <img src={require('./media/contacts/skype.png')} />
              </a>

              <a target="_blank" rel="nofollow noopener noreferrer" href="https://instagram.com/ferggren/">
                <img src={require('./media/contacts/instagram.png')} />
              </a>

              <a target="_blank" rel="nofollow noopener noreferrer" href="https://telegram.me/ferggren">
                <img src={require('./media/contacts/telegram.png')} />
              </a>

              <a target="_blank" rel="nofollow noopener noreferrer" href="https://vk.com/id4867738">
                <img src={require('./media/contacts/vk.png')} />
              </a>

              <a target="_blank" rel="nofollow noopener noreferrer" href="https://www.facebook.com/ferggren">
                <img src={require('./media/contacts/facebook.png')} />
              </a>

              <a target="_blank" rel="nofollow noopener noreferrer" href="https://steamcommunity.com/id/ferggren/">
                <img src={require('./media/contacts/steam.png')} />
              </a>

              <div className="floating-clear" />
            </div>
          </div>
        </div>

        <div className="landing-tags">
          Feed tags
        </div>

        <div className="landing-feed">
          Feed
        </div>
      </div>
    );
  }
});

module.exports = SiteLanding;