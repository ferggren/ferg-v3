/**
 * @file Site Landing
 * @name SiteLanding
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React          = require('react');
var ContentWrapper = require('components/view/content-wrapper');
var SiteHeader     = require('components/site-header');
var Lang           = require('libs/lang');
var { setTitle }   = require('redux/actions/title');
var { connect }    = require('react-redux');
var TagsCloud      = require('components/tags-cloud');
var { loadTags }   = require('redux/actions/tags');
var Paginator      = require('components/paginator');
var Grid           = require('components/site-grid');
var { loadFeed }   = require('redux/actions/feed');

require('./style.scss');
require('styles/partials/loader');

Lang.exportStrings('landing', require('./lang/en.js'), 'en');
Lang.exportStrings('landing', require('./lang/ru.js'), 'ru');

var SiteLanding = React.createClass({
  componentWillMount() {
    this._updateTitle();
  },

  componentDidMount() {
    if (typeof this.props.tags.list == 'undefined') {
      this._loadTags();
    }

    this._updateFeedIfNeeded();
    this._updateTitle();
  },

  componentDidUpdate(prev_props) {
    if (prev_props.lang != this.props.lang) {
      this._updateTitle();
    }

    this._updateFeedIfNeeded();
  },

  /**
   *  Update feed if props is changed
   */
  _updateFeedIfNeeded() {
    var feed = this.props.feed;
    if (feed.loading) return;

    var query = this.props.location.query;
    var lang  = this.props.lang;
    var page  = query.page ? parseInt(query.page) : 1;
    var tag   = query.tag ? query.tag : '';

    var update_needed = false;
    update_needed = update_needed || feed.page != page;
    update_needed = update_needed || feed.tag  != tag;
    update_needed = update_needed || feed.lang != lang;

    if (!update_needed) {
      return;
    }

    this.props.dispatch(loadFeed(page, tag));
  },

  /**
   *  Load page tags
   */
  _loadTags() {
    this.props.dispatch(loadTags("feed"));
  },

  /**
   *  Update page title
   */
  _updateTitle() {
    this.props.dispatch(setTitle(Lang.get('landing.title_default')));
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

    if (this.props.feed.list == false || !this.props.feed.list.length) {
      return (
        <div className="landing__not_found">
          {Lang.get('landing.feed_not_found')}
        </div>
      );
    }

    return (
      <div className="landing__grid">
        <Grid list={this.props.feed.list}/>
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

    var tag = this.props.feed.tag;
    var url = '/' + this.props.lang + '/?';

    if (tag) url += 'tag=' + encodeURIComponent(tag) + '&';
    url += 'page=%page%';

    return (
      <div className="landing__paginator">
        <Paginator
          page={this.props.feed.page}
          pages={this.props.feed.pages}
          url={url}
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

    var url = '/' + this.props.lang + '/?tag=%tag%';
    var url_selected = '/' + this.props.lang + '/';

    return (
      <div className="landing-feed__tags">
        <TagsCloud
          group={"feed"}
          tags={tags.list}
          selected={this.props.feed.tag}
          url={url}
          url_selected={url_selected}
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