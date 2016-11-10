/**
 * @file Site Page
 * @name SitePage
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var PAGE_API_KEY = 'page';
var PAGE_API_URL = '/api/pages/getPage';

var React        = require('react');
var { connect }  = require('react-redux');
var { Link }     = require('react-router');
var { setTitle } = require('redux/actions/title');
var Lang         = require('libs/lang');
var NiceTime     = require('libs/nice-time');
var Wrapper      = require('components/site/view-wrapper');
var PageContent  = require('components/shared/page-content');
var TagsCloud    = require('components/shared/tags-cloud');

var { makeApiRequest, clearApiData } = require('redux/actions/api');

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

  componentWillUnmount() {
    // this.props.dispatch(clearApiData(PAGE_API_KEY));
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

    if (page.loading || !page.loaded) {
      return this.props.dispatch(setTitle(Lang.get(
        'page.page_' + this.state.type + '_loading'
      )));
    }

    if (!page || !page.data.id) {
      return this.props.dispatch(setTitle(Lang.get(
        'page.page_' + this.state.type + '_not_found'
      )));
    }

    if (!page.data || !page.data.title) {
      return this.props.dispatch(setTitle(Lang.get(
        'page.page_' + this.state.type + '_empty'
      )));
    }

    return this.props.dispatch(setTitle(Lang.get(
      'page.page_' + this.state.type, {title: page.data.title}
    )));
  },

  /**
   *  Update page info if needed
   */
  _updatePageIfNeeded() {
    var id    = this.props.params.page_id;
    var lang  = this.props.lang;

    if (this.props.page) {
      var page = this.props.page;

      if (page.loading) return;
      if (!page.loaded) return;

      var update = false;
      update = update || page.lang != lang;
      update = update || page.options.id != id;

      if (!update) return;
    }

    this.props.dispatch(makeApiRequest(
      PAGE_API_KEY, PAGE_API_URL, {
        id
      }
    ));
  },

  /**
   *  Make page loader
   */
  _makePageLoader() {
    var page = this.props.page;

    if (!page || !page.loading) return null;

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
    var page = this.props.page;

    if (!page || !page.loaded || !page.error) return null;

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

    if (!page || !page.loaded || page.error) return null;

    var style = {};

    var header = null;
    var title  = null;
    var desc   = null;
    var date   = null;
    var tags   = null;
    var link   = null;

    if (page.data.preview && page.data.preview.big) {
      style.backgroundImage = "url('" + page.data.preview.big + "')";
      link = (
        <a
          className="page__preview-link"
          href={page.data.preview.photo}
          target="_blank"
        >
          {Lang.get('page.open_preview')}
        </a>
      );
    }

    if (page.data.desc) {
      desc = <div className="page__preview-desc">{page.data.desc}</div>;
    }

    if (page.data.title) {
      title = <div className="page__preview-title">{page.data.title}</div>;
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

    if (page.data.timestamp) {
      date = (
        <div className="page__preview-date">
          {NiceTime.niceMonthFormat(page.data.timestamp)}
        </div>
      );
    }

    if (page.data.tags) {
      tags = {};
      page.data.tags.split(',').forEach(tag => {
        if (!(tag = tag.trim())) return;
        tags[tag] = 1;
      });

      var url = '/' + this.props.lang + '/' + page.data.type + '/';
      url += '?tag=%tag%';

      tags = (
        <Wrapper>
          <TagsCloud
            group={page.data.type}
            tags={tags}
            selected={""}
            url={url}
          />
        </Wrapper>
      );
    }

    return (
      <div className={"page page--" + page.data.type}>
        <div className="page__preview" style={style}>
          {header}
          {link}
          {date}
        </div>
        <PageContent content={page.data.html} />
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
  if (!params.page_id) {
    return [];
  }

  var state  = store.getState();
  var ret    = [];
  var update = false;

  if (!state.api[PAGE_API_KEY]) {
    update = true;
  }
  else {
    var page = state.api[PAGE_API_KEY];

    if (!page || !page.options || page.options.id != params.page_id) {
      update = true;
    }
  }

  if (update) {
    ret.push(
      store.dispatch(makeApiRequest(
        PAGE_API_KEY, PAGE_API_URL, {
          id: params.page_id,
        }
      ))
    );
  }

  return ret;
}

function mapStateToProps(state) {
  return {
    lang: state.lang,
    url:  state.location,
    page: state.api[PAGE_API_KEY] ? state.api[PAGE_API_KEY] : false,
  }
}

module.exports = connect(mapStateToProps)(SitePage);  