/**
 * @file Site Page
 * @name SitePage
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React        = require('react');
var { connect }  = require('react-redux');
var { Link }     = require('react-router');
var { setTitle } = require('redux/actions/title');
var { loadPage } = require('redux/actions/page');
var Lang         = require('libs/lang');
var NiceTime     = require('libs/nice-time');
var Wrapper      = require('components/site/view-wrapper');
var PageContent  = require('components/shared/page-content');
var TagsCloud    = require('components/shared/tags-cloud');

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

    var page = this.props.page;

    if (!page || !page.id) {
      return this.props.dispatch(setTitle(Lang.get(
        'page.page_' + this.state.type + '_not_found'
      )));
    }

    if (page.loading) {
      return this.props.dispatch(setTitle(Lang.get(
        'page.page_' + this.state.type + '_loading'
      )));
    }

    if (!page.info || !page.info.title) {
      return this.props.dispatch(setTitle(Lang.get(
        'page.page_' + this.state.type + '_empty'
      )));
    }

    return this.props.dispatch(setTitle(Lang.get(
      'page.page_' + this.state.type, {title: page.info.title}
    )));
  },

  /**
   *  Update page info if needed
   */
  _updatePageIfNeeded() {
    var page = this.props.page;

    if (page.loading) return;

    var id    = this.props.params.page_id;
    var lang  = this.props.lang;

    var update_needed = false;
    update_needed = update_needed || page.lang != lang;
    update_needed = update_needed || page.id != id;

    if (!update_needed) {
      return;
    }

    this.props.dispatch(loadPage(id));
  },

  /**
   *  Make page loader
   */
  _makePageLoader() {
    if (!this.props.page.loading) return null;

    return (
      <Wrapper>
        <div className="page__loader">
          <div className="loader" />
        </div>
      </Wrapper>
    );
  },

  /**
   *  Make page loader
   */
  _makePageError() {
    if (this.props.page.loading) return null;
    if (!this.props.page.error) return null;

    return (
      <Wrapper>
        <div className="page__error">
          {Lang.get('page.error_not_found')}
        </div>
      </Wrapper>
    );
  },

  /**
   *  Make page loader
   */
  _makePage() {
    var page = this.props.page;

    if (page.loading) return;
    if (page.error) return;
    if (!page.info) return;

    var style = {};

    if (page.info.preview && page.info.preview.big) {
      style.backgroundImage = "url('" + page.info.preview.big + "')";
    }

    var header = null;
    var title  = null;
    var desc   = null;
    var date   = null;
    var tags   = null;

    if (page.info.desc) {
      desc = <div className="page__preview-desc">{page.info.desc}</div>;
    }

    if (page.info.title) {
      title = <div className="page__preview-title">{page.info.title}</div>;
    }

    if (desc || title) {
      header = (
        <div className="page__preview-header">
          {title}
          <br />
          {desc}
        </div>
      );
    }

    if (page.info.timestamp) {
      date = (
        <div className="page__preview-date">
          {NiceTime.niceDateFormat(page.info.timestamp)}
        </div>
      );
    }

    if (page.info.tags) {
      tags = {};
      page.info.tags.split(',').forEach(tag => {
        if (!(tag = tag.trim())) return;
        tags[tag] = 1;
      });

      var url = '/' + this.props.lang + '/' + page.info.type + '/';
      url += '?tag=%tag%';

      tags = (
        <Wrapper>
          <TagsCloud
            group={page.info.type}
            tags={tags}
            selected={""}
            url={url}
          />
        </Wrapper>
      );
    }

    return (
      <div className={"page page--" + page.info.type}>
        <div className="page__preview" style={style}>
          {header}
          {date}
        </div>
        <PageContent content={page.info.html} />
        {tags}
      </div>
    );
  },

  render() {
    return (
      <div>
        {this._makePageLoader()}
        {this._makePageError()}
        {this._makePage()}
      </div>
    );
  }
});

SitePage.fetchData = (store, params) => {
  if (!params.page_type) {
    return [];
  }

  if (!params.page_id) {
    return [];
  }
  
  return [
    store.dispatch(loadPage(params.page_id)),
  ];
}

function mapStateToProps(state) {
  return {
    lang: state.lang,
    url:  state.location,
    page: state.page,
  }
}

module.exports = connect(mapStateToProps)(SitePage);  