/**
 * @file Site Landing
 * @name SiteLanding
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React              = require('react');
var ContentWrapper     = require('components/view/content-wrapper');
var SiteHeader         = require('components/site-header');
var Lang               = require('libs/lang');
var { setTitle }       = require('redux/actions/title');
var { connect }        = require('react-redux');
var TagsCloud          = require('components/tags-cloud');
var { loadTags }       = require('redux/actions/tags');
var { browserHistory } = require('react-router');

var {
  loadFeed,
  loadFeedByTag,
  loadFeedPage
} = require('redux/actions/feed');

require('./style.scss');
require('styles/partials/floating_clear');
require('styles/partials/loader');

Lang.exportStrings('landing', require('./lang/en.js'), 'en');
Lang.exportStrings('landing', require('./lang/ru.js'), 'ru');

var SiteLanding = React.createClass({
  componentDidMount() {
    if (this.props.feed.list == false) {
      this._loadFeed();  
    }

    else if (this.props.feed.error) {
      this._loadFeed();
    }

    if (typeof this.props.tags.list == 'undefined') {
      this._loadTags();
    }

    else if (this.props.tags.list == false) {
      this._loadTags();
    }

    else if (this.props.tags.error) {
      this._loadTags();
    }

    this._updateTitle();
  },

  componentDidUpdate(prev_props) {
    if (prev_props.lang != this.props.lang) {
      this._loadFeed();
      this._updateTitle();
      return;
    }
  },

  _loadFeed() {
    this.props.dispatch(loadFeed(
      this.props.feed.page,
      this.props.feed.tag
    ));
  },

  _loadTags() {
    this.props.dispatch(loadTags("feed"));
  },

  _updateTitle() {
    this.props.dispatch(setTitle(Lang.get('landing.title_default')));
  },

  /**
   *  Select feed group
   *
   *  @param {string} group Feed group
   *  @param {string} tag Feed tag
   */
  _selectTag(group, tag) {
    tag = this.props.feed.tag == tag ? '' : tag;

    var url = '/' + this.props.lang + '/';
    if (tag) url += '?tag=' + encodeURIComponent(tag);

    browserHistory.push(url);

    this.props.dispatch(loadFeedByTag(tag));
  },

  /**
   *  Select feed page
   *
   *  @param {int} page Feed page
   */
  _selectPage(page) {
    var tag = this.props.feed.tag;
    var url = '/' + this.props.lang + '/?';

    if (tag) url += 'tag=' + encodeURIComponent(tag) + '&';
    url += 'page=' + page;

    browserHistory.push(url);

    this.props.dispatch(loadFeedPage(page));
  },

  /**
   *  Make feed loader
   */
  _makeFeedLoader() {
    if (!this.props.feed.loading) {
      return null;
    }

    return (
      <div className="loader" />
    );
  },

  /**
   *  Make feed
   */
  _makeFeed() {
    if (this.props.feed.loading || this.props.feed.error) {
      return;
    }

    if (this.props.feed.list == false) {
      return (
        <div className="landing__not_found">
          {Lang.get('landing.feed_not_found')}
        </div>
      );
    }

    return (
      <div className="landing__grid">
        GRID
      </div>
    );
  },

  /**
   *  Make feed error
   */
  _makeFeedError() {
    if (!this.props.feed.error) {
      return;
    }

    return (
      <div className="landing__error">
        {Lang.get('landing.error_' + this.props.feed.error)}
      </div>
    );
  },

  /**
   *  Make feed paginator
   */
  _makeFeedPaginator() {
    if (this.props.feed.loading || this.props.feed.list == false) {
      return;
    }

    return (
      <div className="landing__paginator">
        <Paginator
          page={this.state.feed.page}
          pages={this.state.feed.pages}
          onSelect={this._selectPage}
        />
      </div>
    );
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
        <div className="landing__not_found">
          {Lang.get('landing.tags_not_found')}
        </div>
      );
    }

    return (
      <div className="landing-feed__tags">
        <TagsCloud
          group={"feed"}
          tags={tags.list}
          selected={this.props.feed.tag}
          onSelect={this._selectTag}
        />
      </div>
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
      <div className="landing__error">
        {Lang.get('landing.error_' + this.props.tags.error)}
      </div>
    );
  },

  render() {
    return (
      <div>
        <SiteHeader />

        <ContentWrapper>

          <div className="landing-tags">
            {this._makeTagsLoader()}
            {this._makeTagsError()}
            {this._makeTags()}
          </div>

          <br />

          <div className="landing-feed">
            {this._makeFeedLoader()}
            {this._makeFeedError()}
            {this._makeFeed()}
            {this._makeFeedPaginator()}
          </div>

        </ContentWrapper>
      </div>
    );
  }
});

SiteLanding.fetchData = (store, params) => {
  return [
    store.dispatch(loadFeed(
      params.page ? params.page : 1,
      params.tag ? params.tag : '',
    )),
    store.dispatch(loadTags("feed")),
  ];
}

function mapStateToProps(state) {
  return {
    lang: state.lang,
    feed: state.feed,
    tags: state.tags.feed ? state.tags.feed : {},
  }
}

module.exports = connect(mapStateToProps)(SiteLanding);