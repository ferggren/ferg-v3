/**
 * @file Site Pages
 * @name SitePages
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var PAGES_TAGS_API_KEY = 'pages_tags';
var PAGES_TAGS_API_URL = '/api/tags/getTags';
var PAGES_API_KEY      = 'pages';
var PAGES_API_URL      = '/api/pages/getPages';

var React        = require('react');
var { connect }  = require('react-redux');
var Lang         = require('libs/lang');
var { setTitle } = require('redux/actions/title');
var Wrapper      = require('components/site/view-wrapper');
var TagsCloud    = require('components/shared/tags-cloud');
var Paginator    = require('components/shared/paginator');
var Grid         = require('components/shared/photos-grid');

var { makeApiRequest, clearApiData } = require('redux/actions/api');

require('./styles.scss');
require('styles/partials/loader');
require('styles/partials/floating_clear');

Lang.exportStrings('pages', require('./lang/en.js'), 'en');
Lang.exportStrings('pages', require('./lang/ru.js'), 'ru');

var SitePages = React.createClass({
  getInitialState() {
    return {type: this._getType()};
  },

  componentWillMount() {
    this._updateTitle();
  },

  componentDidMount() {
    this._updateType();
    this._updateTitle();
    this._updateTagsIfNeeded();
    this._updatePagesIfNeeded();
  },

  componentDidUpdate(prev_props, prev_state) {
    this._updateType();
    this._updateTitle();
    this._updateTagsIfNeeded();
    this._updatePagesIfNeeded();
  },

  componentWillUnmount() {
    this.props.dispatch(clearApiData(PAGES_API_KEY));
    this.props.dispatch(clearApiData(PAGES_TAGS_API_KEY));
  },

  /**
   *  Update pages type
   */
  _updateType() {
    if (this._getType() == this.state.type) return;
    this.setState({type: this._getType()});
  },

  /**
   *  Load tags if pages type is changed or tags is empty
   */
  _updateTagsIfNeeded() {
    if (this.props.tags && this.props.tags.options.group == this.state.type) {
      return;
    }

    this.props.dispatch(makeApiRequest(
      PAGES_TAGS_API_KEY, PAGES_TAGS_API_URL, {
        group: this.state.type,
      }
    ));
  },

  /**
   *  Load tags if some params is changed
   */
  _updatePagesIfNeeded() {
    var query = this.props.location.query;
    var lang  = this.props.lang;
    var page  = query.page ? parseInt(query.page) : 1;
    var tag   = query.tag ? query.tag : '';
    var type  = this.state.type;

    if (this.props.pages) {
      var pages = this.props.pages;

      if (pages.loading) return;
      if (!pages.loaded) return;

      var update = false;
      update = update || pages.lang != this.props.lang;
      update = update || pages.options.tag  != tag;
      update = update || pages.options.page != page;
      update = update || pages.options.type != type;

      if (!update) return;
    }

    this.props.dispatch(makeApiRequest(
      PAGES_API_KEY, PAGES_API_URL, {
        type,
        page,
        tag,
      }
    ));
  },

  /**
   *  Get pages type
   *
   *  @return {string} pages type
   */
  _getType() {
    var path  = this.props.location.pathname;
    var match = path.match(/\/(blog|dev|events)\//);

    if (!match) {
      return false;
    }

    return match[1];
  },

  /**
   *  Update page titile
   */
  _updateTitle() {
    this.props.dispatch(setTitle(Lang.get(
      'pages.title_' + this.state.type
    )));
  },

  /**
   *  Makes tags loader
   */
  _makeTagsLoader() {
    if (this.props.tags && !this.props.tags.loading) {
      return null;
    }

    return (
      <div className="loader" />
    );
  },

  /**
   *  Make tags cloud
   */
  _makeTags() {
    var tags = this.props.tags;

    if (!tags || tags.loading || tags.error) {
      return;
    }

    if (tags.data == false || !Object.keys(tags.data).length) {
      return (
        <div className="pages__not_found">
          {Lang.get('pages.tags_not_found')}
        </div>
      );
    }

    var url_selected = '/' + this.props.lang + '/';
    url_selected    += this.state.type + '/';

    var url = url_selected + '?tag=%tag%';

    return (
      <TagsCloud
        group={this.state.type}
        tags={tags.data}
        selected={this.props.pages ? this.props.pages.options.tag : ''}
        url={url}
        url_selected={url_selected}
      />
    );
  },

  /**
   *  Makes tags error
   */
  _makeTagsError() {
    var tags = this.props.tags;

    if (!tags || tags.loading || !tags.error) {
      return;
    }

    return (
      <div className="pages__error">
        {Lang.get('pages.error_' + tags.error)}
      </div>
    );
  },

  /**
   *  Make feed loader
   */
  _makePagesLoader() {
    if (this.props.pages && !this.props.pages.loading) {
      return null;
    }

    return (
      <div className="loader" />
    );
  },

  /**
   *  Make pages
   */
  _makePages() {
    var pages = this.props.pages;

    if (!pages || !pages.loaded || pages.error) {
      return null;
    }

    if (pages.data.list == false || !pages.data.list.length) {
      return (
        <div className="pages__not_found">
          {Lang.get('pages.pages_not_found')}
        </div>
      );
    }

    var list = pages.data.list.map(page => {
      return {
        date:    page.timestamp,
        ratio:   10,
        title:   page.title,
        desc:    page.desc,
        url:     '/' + this.props.lang + '/' + page.type + '/' + page.id,
        preview: (page.preview && page.preview.small) ? page.preview.small : '',
      }
    });

    return (
      <Grid list={list}/>
    );
  },

  /**
   *  Make pages error
   */
  _makePagesError() {
    var pages = this.props.pages;

    if (!pages || !pages.loaded || !pages.error) {
      return null;
    }

    return (
      <div className="pages__error">
        {Lang.get('pages.error_' + pages.error)}
      </div>
    );
  },

  /**
   *  Make pages paginator
   */
  _makePagesPaginator() {
    var pages = this.props.pages;

    if (!pages || !pages.loaded || pages.error) {
      return null;
    }

    if (pages.options.page == 1 && !pages.data.list.length) {
      return null;
    }

    var tag = pages.options.tag;
    var url = '/' + this.props.lang + '/';
    url += this.state.type + '/?'

    if (tag) url += 'tag=' + encodeURIComponent(tag) + '&';
    url += 'page=%page%';

    return (
      <div className="pages__paginator">
        <Paginator
          page={pages.data.page}
          pages={pages.data.pages}
          url={url}
        />
      </div>
    );
  },

  render() {
    return (
      <Wrapper>

        <div className="pages__tags-wrapper">
          <div className="pages__tags">
            {this._makeTagsLoader()}
            {this._makeTagsError()}
            {this._makeTags()}
          </div>
        </div>

        <div className="pages__grid-wrapper">
          <div className="pages__grid">
            {this._makePagesLoader()}
            {this._makePagesError()}
            {this._makePages()}
            {this._makePagesPaginator()}
          </div>
        </div>

        <div className="floating-clear" />
      </Wrapper>
    );
  }
});

SitePages.fetchData = (store, params) => {
  if (!params.page_type) {
    return [];
  }

  var state = store.getState();
  var ret   = [];

  if (!state.api[PAGES_TAGS_API_KEY]) {
    ret.push(
      store.dispatch(makeApiRequest(
        PAGES_TAGS_API_KEY, PAGES_TAGS_API_URL, {
          group: params.page_type,
          cache: true,
        }
      )),
    );
  }

  if (!state.api[PAGES_API_KEY]) {
    ret.push(
      store.dispatch(makeApiRequest(
        PAGES_API_KEY, PAGES_API_URL, {
          type:  params.page_type,
          page:  params.page ? params.page : 1,
          tag:   params.tag ? params.tag : '',
          cache: true,
        }
      )),
    );
  }

  return ret;
}

function mapStateToProps(state) {
  return {
    lang:  state.lang,
    pages: state.api[PAGES_API_KEY] ? state.api[PAGES_API_KEY] : false,
    tags:  state.api[PAGES_TAGS_API_KEY] ? state.api[PAGES_TAGS_API_KEY] : false,
  }
}

module.exports = connect(mapStateToProps)(SitePages);