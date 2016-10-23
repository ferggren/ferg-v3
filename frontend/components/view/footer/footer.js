/**
 * @file Site footer
 * @name Footer
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React = require('react');
var Lang  = require('libs/lang');

require('./footer.scss');
require('styles/partials/floating_clear');

Lang.exportStrings(
  'footer',
  require('./footer.lang-' + Lang.getLang() + '.js')
);

var Footer = React.createClass({
  render() {
    var url = window.location.pathname;
    var lang = Lang.getLang() == 'ru' ? 'en' : 'ru';

    url = url.replace(/^\/(ru|en)\//, `/${lang}/`);

    var className = 'site-footer__lang site-footer__lang--' + lang;

    return (
      <div className="site-footer__wrapper">
        <div className="site-footer">
          <div className={className}>
            <a href={url}>
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

module.exports = Footer;