/**
 * @file Site Page
 * @name SitePage
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React        = require('react');
var { connect }  = require('react-redux');
var Lang         = require('libs/lang');
var { setTitle } = require('redux/actions/title');
var Wrapper      = require('components/site/view-wrapper');

require('./styles.scss');
require('styles/partials/loader');

Lang.exportStrings('page', require('./lang/en.js'), 'en');
Lang.exportStrings('page', require('./lang/ru.js'), 'ru');

require('styles/partials/loader');

var SitePage = React.createClass({
  getInitialState() {
    return {type: this._getPageType()}
  },

  componentWillMount() {
    this._updateTitle();
  },

  componentDidMount() {
    this._updateType();
    this._updateTitle();
    this._updatePageIfNeeded();
  },

  componentDidUpdate(prev_props, prev_state) {
    if (prev_props.url != this.props.url) {
      if (this._updateType()) return;
    }

    this._updatePageIfNeeded();
    this._updateTitle();
  },

  /**
   *  Check if page type is changed and update it
   */
  _updateType() {
    var type = this._getPageType();

    if (this.state.type == type) {
      return false;
    }

    this.setState({type});
    return true;
  },

  /**
   *  Get page type
   *
   *  @return {string} page type
   */
  _getPageType() {
    var path  = this.props.location.pathname;
    var match = path.match(/\/(blog|events|dev)\//);

    return match ? match[1] : false;
  },

  /**
   *  Update page title
   */
  _updateTitle() {
    if (!this.state.type) return;

    if (!this.props.page || !this.props.page.id) {
      return this.props.dispatch(setTitle(Lang.get(
        'page.page_' + this.state.type + '_not_found'
      )));
    }

    if (this.props.page.loading) {
      return this.props.dispatch(setTitle(Lang.get(
        'page.page_' + this.state.type + '_loading'
      )));
    }

    if (!this.props.page.title) {
      return this.props.dispatch(setTitle(Lang.get(
        'page.page_' + this.state.type + '_empty'
      )));
    }

    return this.props.dispatch(setTitle(Lang.get(
      'page.page_' + this.state.type, {title: this.props.page.title}
    )));
  },

  /**
   *  Update page info if needed
   */
  _updatePageIfNeeded() {
    console.log('page update?');
  },

  render() {
    return (
      <Wrapper>Page {this.props.type}</Wrapper>
    );
  }
});

SitePage.fetchData = (store, params) => {
  if (!params.page_type) {
    return [];
  }

  return [];
}

function mapStateToProps(state) {
  return {
    lang: state.lang,
    url:  state.location,
  }
}

module.exports = connect(mapStateToProps)(SitePage);