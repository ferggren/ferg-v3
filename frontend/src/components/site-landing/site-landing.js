/**
 * @file Site Storage
 * @name SiteStorage
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React          = require('react');
var ContentWrapper = require('components/view/content-wrapper');
var Lang           = require('libs/lang');
var { setTitle }   = require('redux/actions/title');
var { connect }    = require('react-redux');

require('./style.scss');
require('styles/partials/floating_clear');
require('styles/partials/loader');

Lang.exportStrings('landing', require('./lang/en.js'), 'en');
Lang.exportStrings('landing', require('./lang/ru.js'), 'ru');

var SiteLanding = React.createClass({
  componentWillMount() {
    Lang.setLang(this.props.lang);
    this._updateTitle();
  },

  componentDidMount() {

  },

  componentDidUpdate(prevProps, prevState) {
    Lang.setLang(this.props.lang);
    this._updateTitle();
  },

  _updateTitle() {
    this.props.dispatch(setTitle(Lang.get('landing.title_default')));
  },

  render() {
    return (
      <div>
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

        <ContentWrapper>

          <div className="landing-tags">
            Feed tags
          </div>

          <br />

          <div className="landing-feed">
            Feed
          </div>

        </ContentWrapper>
      </div>
    );
  }
});

function mapStateToProps(state) {
  return {
    lang: state.lang
  }
}

module.exports = connect(mapStateToProps)(SiteLanding);