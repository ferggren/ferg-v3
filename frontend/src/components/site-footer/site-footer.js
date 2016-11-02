/**
 * @file Site footer
 * @name SiteFooter
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React              = require('react');
var Lang               = require('libs/lang');
var { browserHistory } = require('react-router');
var { connect }        = require('react-redux');
var { setLang }        = require('redux/actions/lang');

require('./style.scss');
require('styles/partials/floating_clear');

Lang.exportStrings('footer', require('./lang/ru.js'), 'ru');
Lang.exportStrings('footer', require('./lang/en.js'), 'en');

var SiteFooter = React.createClass({
  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.lang != nextProps.lang) {
      return true;
    }

    if (this.props.location != nextProps.location) {
      return true;
    }

    return false;
  },

  /**
   *  Swap lang
   */
  _swapLang(new_lang, new_location) {
    this.props.dispatch(setLang(new_lang));
    browserHistory.push(new_location);
    Lang.setLang(new_lang);
  },

  render() {
    Lang.setLang(this.props.lang);

    var lang = this.props.lang == 'ru' ? 'en' : 'ru';
    var url  = this.props.location;

    url = url.replace(/^\/(ru|en)\//, '/' + lang + '/');

    var className = 'site-footer__lang site-footer__lang--' + lang;

    return (
      <div className="site-footer__wrapper">
        <div className="site-footer">
          <div className={className}>
            <a href={url} onClick={e => {
              e.preventDefault();
              this._swapLang(lang, url);
            }}>
              {Lang.get('footer.swap_lang')}
            </a>
          </div>

          <div className="site-footer__copy">
            ferg.in &copy; 2013 – 2016
          </div>

          <div className="floating-clear"></div>
        </div>
      </div>
    );
  },
});

function mapStateToProps(state) {
  return {
    lang:     state.lang,
    location: state.location,
  }
}

module.exports = connect(mapStateToProps)(SiteFooter);