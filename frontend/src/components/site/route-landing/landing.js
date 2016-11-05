/**
 * @file Site Landing
 * @name SiteLanding
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var FEED_TAGS_API_KEY = 'feed_tags';
var FEED_TAGS_API_URL = '/api/tags/getTags';
var FEED_API_KEY      = 'feed';
var FEED_API_URL      = '/api/feed/getFeed';

var React          = require('react');
var { connect }    = require('react-redux');
var Lang           = require('libs/lang');
var clone          = require('libs/clone');
var { setTitle }   = require('redux/actions/title');
var ContentWrapper = require('components/site/view-wrapper');
var SiteHeader     = require('components/site/view-header');
var TagsCloud      = require('components/shared/tags-cloud');
var Paginator      = require('components/shared/paginator');
var Grid           = require('components/shared/photos-grid');

var { makeApiRequest, clearApiData } = require('redux/actions/api');

require('./style.scss');
require('styles/partials/loader');

Lang.exportStrings('landing', require('./lang/en.js'), 'en');
Lang.exportStrings('landing', require('./lang/ru.js'), 'ru');

var SiteLanding = React.createClass({
  componentWillMount() {
    this._updateTitle();
  },

  componentDidMount() {
    this._updateTagsIfNeeded();
    this._updateFeedIfNeeded();
    this._updateTitle();
  },

  componentDidUpdate(prev_props) {
    if (prev_props.lang != this.props.lang) {
      this._updateTitle();
    }

    this._updateTagsIfNeeded();
    this._updateFeedIfNeeded();
  },

  componentWillUnmount() {
    this.props.dispatch(clearApiData(FEED_TAGS_API_KEY));
    this.props.dispatch(clearApiData(FEED_API_KEY));
  },

  /**
   *  Update feed if props is changed
   */
  _updateFeedIfNeeded() {
    var query = this.props.location.query;
    var page  = query.page ? parseInt(query.page) : 1;
    var tag   = query.tag ? query.tag : '';

    if (this.props.feed) {
      var feed = this.props.feed;

      if (feed.loading) return;
      if (!feed.loaded) return;

      var update = false;
      update = update || feed.lang != this.props.lang;
      update = update || feed.options.tag  != tag;
      update = update || feed.options.page != page;

      if (!update) return;
    }

    this.props.dispatch(makeApiRequest(
      FEED_API_KEY, FEED_API_URL, {
        page,
        tag,
      }
    ));
  },

  /**
   *  Update tags
   */
  _updateTagsIfNeeded() {
    if (this.props.tags && this.props.tags.options.group == 'feed') {
      return;
    }

    this.props.dispatch(makeApiRequest(
      FEED_TAGS_API_KEY, FEED_TAGS_API_URL, {
        group: 'feed'
      }
    ));
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
    if (this.props.feed && !this.props.feed.loading) {
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
    var feed = this.props.feed;

    if (!feed || feed.loading || feed.error) {
      return;
    }

    if (!feed.data.list.length) {
      return (
        <div className="landing__not_found">
          {Lang.get('landing.feed_not_found')}
        </div>
      );
    }

    var list = feed.data.list;

    if (feed.options.tag) {
      var list = clone(list).map(item => {
        if (item.type == 'gallery') {
          item.url += '?tag=' + encodeURIComponent(feed.options.tag);
        }

        return item;
      });
    }

    return (
      <div className="landing__grid">
        <Grid list={list}/>
      </div>
    );
  },

  /**
   *  Make feed error
   */
  _makeFeedError() {
    var feed = this.props.feed;

    if (!feed || feed.loading || !feed.error) {
      return;
    }

    return (
      <div className="landing__error">
        {Lang.get('landing.error_' + feed.error)}
      </div>
    );
  },

  /**
   *  Make feed paginator
   */
  _makeFeedPaginator() {
    var feed = this.props.feed;

    if (!feed || feed.loading || feed.error) {
      return null;
    }

    if (feed.data.page == 1 && !feed.data.list.length) {
      return null;
    }

    var tag = feed.options.tag;
    var url = '/' + this.props.lang + '/?';

    if (tag) url += 'tag=' + encodeURIComponent(tag) + '&';
    url += 'page=%page%';

    return (
      <div className="landing__paginator">
        <Paginator
          page={feed.data.page}
          pages={feed.data.pages}
          url={url}
        />
      </div>
    );
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
          tags={tags.data}
          selected={this.props.feed ? this.props.feed.options.tag : ''}
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
    var tags = this.props.tags;

    if (!tags || tags.loading || !tags.error) {
      return;
    }

    return (
      <div className="landing__error">
        {Lang.get('landing.error_' + tags.error)}
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
    store.dispatch(makeApiRequest(
      FEED_API_KEY, FEED_API_URL, {
        page:  params.page ? params.page : 1,
        tag:   params.tag ? params.tag : '',
        cache: true,
      }
    )),

    store.dispatch(makeApiRequest(
      FEED_TAGS_API_KEY, FEED_TAGS_API_URL, {
        group: 'feed',
        cache: true,
      }
    )),
  ];
}

function mapStateToProps(state) {
  return {
    lang: state.lang,
    feed: state.api[FEED_API_KEY] ? state.api[FEED_API_KEY] : false,
    tags: state.api[FEED_TAGS_API_KEY] ? state.api[FEED_TAGS_API_KEY] : false,
  }
}

module.exports = connect(mapStateToProps)(SiteLanding);