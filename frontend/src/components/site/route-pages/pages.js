/**
 * @file Site Pages
 * @name SitePages
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React        = require('react');
var { connect }  = require('react-redux');
var Lang         = require('libs/lang');
var { loadTags } = require('redux/actions/tags');
var { setTitle } = require('redux/actions/title');
var Wrapper      = require('components/site/view-wrapper');
var TagsCloud    = require('components/shared/tags-cloud');
var Paginator    = require('components/shared/paginator');
var Grid         = require('components/shared/photos-grid');

var {
  loadPages,
  setPagesType
} = require('redux/actions/pages');

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
    if (this.state.type != this.props.type) return;
    if (typeof this.props.tags.list != 'undefined') return;

    this.props.dispatch(loadTags(this.state.type));
  },

  /**
   *  Load tags if some params is changed
   */
  _updatePagesIfNeeded() {
    var pages = this.props.pages;

    if (pages.loading) return;

    var query = this.props.location.query;
    var lang  = this.props.lang;
    var page  = query.page ? parseInt(query.page) : 1;
    var tag   = query.tag ? query.tag : '';
    var type  = pages.type;

    var update_needed = false;
    update_needed = update_needed || pages.page != page;
    update_needed = update_needed || pages.tag  != tag;
    update_needed = update_needed || pages.lang != lang;
    update_needed = update_needed || type != this.state.type;

    if (!update_needed) {
      return;
    }

    if (this.state.type != pages.type) {
      this.props.dispatch(setPagesType(this.state.type));
    }

    this.props.dispatch(loadPages(page, tag));
  },

  /**
   *  Get pages type
   *
   *  @return {string} pages type
   */
  _getType() {
    var path  = this.props.location.pathname;
    var match = path.match(/\/(notes|portfolio|moments)\//);

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
      'pages.title_' + this.state.type + '_default'
    )));
  },

  /**
   *  Makes tags loader
   */
  _makeTagsLoader() {
    if (!this.props.tags.loading) {
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

    if (!tags || !tags.list || tags.loading || tags.error) {
      return;
    }

    if (tags.list == false || !Object.keys(tags.list).length) {
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
        tags={tags.list}
        selected={this.props.pages.tag}
        url={url}
        url_selected={url_selected}
      />
    );
  },

  /**
   *  Makes tags error
   */
  _makeTagsError() {
    if (this.props.tags.loading) {
      return;
    }

    if (!this.props.tags.error) {
      return;
    }

    return (
      <div className="pages__error">
        {Lang.get('pages.error_' + this.props.tags.error)}
      </div>
    );
  },

  /**
   *  Make feed loader
   */
  _makePagesLoader() {
    if (!this.props.pages.loading) {
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
    if (this.props.pages.loading || this.props.pages.error) {
      return;
    }

    if (this.props.pages.list == false || !this.props.pages.list.length) {
      return (
        <div className="pages__not_found">
          {Lang.get('pages.pages_not_found')}
        </div>
      );
    }

    var list = this.props.pages.list.map(page => {
      return {
        date:    page.timestamp,
        ratio:   10,
        title:   page.title,
        desc:    page.desc,
        url:     '/' + this.props.lang + '/' + page.type + '/' + page.id,
        preview: (page.preview && page.preview.big) ? page.preview.big : '',
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
    if (!this.props.pages.error) {
      return;
    }

    return (
      <div className="pages__error">
        {Lang.get('pages.error_' + this.props.pages.error)}
      </div>
    );
  },

  /**
   *  Make pages paginator
   */
  _makePagesPaginator() {
    if (this.props.pages.loading || this.props.pages.list == false) {
      return;
    }

    var tag = this.props.pages.tag;
    var url = '/' + this.props.lang + '/';
    url += this.state.type + '/?'

    if (tag) url += 'tag=' + encodeURIComponent(tag) + '&';
    url += 'page=%page%';

    return (
      <div className="pages__paginator">
        <Paginator
          page={this.props.pages.page}
          pages={this.props.pages.pages}
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

  return [
    store.dispatch(setPagesType(params.page_type)),
    store.dispatch(loadTags(params.page_type)),
    store.dispatch(loadPages(
      params.page ? params.page : 1,
      params.tag ? params.tag : '',
    )),
  ];
}

function mapStateToProps(state) {
  return {
    lang:  state.lang,
    type:  state.pages.type,
    pages: state.pages,
    tags:  state.tags[state.pages.type] ? state.tags[state.pages.type] : {},
  }
}

module.exports = connect(mapStateToProps)(SitePages);