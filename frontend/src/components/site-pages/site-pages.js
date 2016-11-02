/**
 * @file Site Pages
 * @name SitePages
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React          = require('react');
var ContentWrapper = require('components/view/content-wrapper');
var Lang           = require('libs/lang');
var { setTitle }   = require('redux/actions/title');
var { connect }    = require('react-redux');

require('styles/partials/loader');

Lang.exportStrings('pages', require('./lang/en.js'), 'en');
Lang.exportStrings('pages', require('./lang/ru.js'), 'ru');

var SitePages = React.createClass({
  getInitialState() {
    console.log(this.props);

    return {

    }  
  },

  componentWillMount() {
    Lang.setLang(this.props.lang);
    this._updateTitle();
  },

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.lang != this.props.lang) {
      Lang.setLang(this.props.lang);
      this._updateTitle();
    }
  },

  componentWillReceiveProps(nextProps) {
  },

  _updateTitle() {
    this.props.dispatch(setTitle(Lang.get(
      'pages.title_' + this.props.type + '_default'
    )));
  },

  render() {
    return (
      <ContentWrapper>Pages {this.props.type}</ContentWrapper>
    );
  }
});

SitePages.fetchData = (store, params) => {
  if (!params.page_type) {
    return [];
  }


  console.log(' ');
  console.log('fetch feed', store.getState().lang, params.page_type);
  console.log(' ');

  return [];
}

function mapStateToProps(state) {
  return {
    lang: state.lang
  }
}

module.exports = connect(mapStateToProps)(SitePages);