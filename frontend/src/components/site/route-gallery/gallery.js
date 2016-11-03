/**
 * @file Site Gallery
 * @name SiteGallery
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React        = require('react');
var { setTitle } = require('redux/actions/title');
var { connect }  = require('react-redux');
var Wrapper      = require('components/site/view-wrapper');
var Lang         = require('libs/lang');

require('styles/partials/loader');

Lang.exportStrings('gallery', require('./lang/en.js'), 'en');
Lang.exportStrings('gallery', require('./lang/ru.js'), 'ru');

var SiteGallery = React.createClass({
  componentWillMount() {
    Lang.setLang(this.props.lang);
    this._updateTitle();
  },

  componentDidUpdate(prevProps, prevState) {
    Lang.setLang(this.props.lang);
    this._updateTitle();
  },

  _updateTitle() {
    this.props.dispatch(setTitle(Lang.get('gallery.title_default')));
  },

  render() {
    return (
      <Wrapper>Gallery</Wrapper>
    );
  }
});

function mapStateToProps(state) {
  return {
    lang: state.lang
  }
}

module.exports = connect(mapStateToProps)(SiteGallery);