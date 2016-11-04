/**
 * @file Site Gallery
 * @name SiteGallery
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React        = require('react');
var { connect }  = require('react-redux');
var { setTitle } = require('redux/actions/title');
var { loadTags } = require('redux/actions/tags');
var Lang         = require('libs/lang');
var Wrapper      = require('components/site/view-wrapper');
var TagsCloud    = require('components/shared/tags-cloud');
var Grid         = require('components/shared/photos-grid');
var Paginator    = require('components/shared/paginator');
var { loadGallery } = require('redux/actions/gallery');

Lang.exportStrings('gallery', require('./lang/en.js'), 'en');
Lang.exportStrings('gallery', require('./lang/ru.js'), 'ru');

require('./styles.scss');
require('styles/partials/loader');

var SiteGallery = React.createClass({
  componentWillMount() {
    this._updateTitle();
  },

  componentDidMount() {
    this._updateTitle();
    this._loadGalleryIfNeeded();
    this._loadTagsIfNeeded();
  },

  componentDidUpdate(prevProps, prevState) {
    this._updateTitle();
    this._loadGalleryIfNeeded();
  },

  /**
   *  Load gallery tags if needed
   */
  _loadTagsIfNeeded() {
    if (typeof this.props.tags.lens != 'undefined') return;

    this.props.dispatch(loadTags([
      'lens',
      'camera',
      'category'
    ]));
  },

  /**
   *  If needed update gallery photos
   */
  _loadGalleryIfNeeded() {
    var gallery = this.props.gallery;

    if (gallery.loading) return;

    var query = this.props.location.query;
    var lang  = this.props.lang;
    var page  = query.page ? parseInt(query.page) : 1;
    var tag   = query.tag ? query.tag : '';

    var update = false;
    update = update || !gallery.loaded;
    update = update || gallery.tag  != tag;
    update = update || gallery.lang != lang;
    update = update || gallery.page != page;

    if (!update) return;

    this.props.dispatch(loadGallery(page, tag));
  },

  /**
   *  Update page title
   */
  _updateTitle() {
    if (!this.props.gallery.tag) {
      this.props.dispatch(setTitle(Lang.get('gallery.title')));
      return;
    }

    this.props.dispatch(setTitle(Lang.get(
      'gallery.tag_title', {tag: this.props.gallery.tag}
    )));
  },

  /**
   *  Make gallery tag groups
   */
  _makeTagGroups() {
    if (!this.props.tags || !this.props.tags.lens) {
      return null;
    }

    var ret = [];

    for (var group in this.props.tags) {
      var tags = this.props.tags[group];

      ret.push(
        <div
          key={group}
          className={"gallery__tags-group gallery__tags-group--" + group}
        >
          {this._makeTags(group, tags)}
        </div>
      );
    };

    return ret;
  },

  /**
   *  Make tags
   */
  _makeTags(group, tags) {
    if (!tags) return null;

    if (tags.loading) {
      return <div className="loader" />;
    }

    if (tags.error) {
      return (
        <div className="gallery__error">
          {Lang.get('gallery.error_' + tags.error)}
        </div>
      );
    }

    var url_selected = '/' + this.props.lang + '/gallery/';
    var url_common   = url_selected + '?tag=%tag%';

    return (
      <TagsCloud
        group={group}
        tags={tags.list}
        selected={this.props.gallery.tag}
        url={url_common}
        url_selected={url_selected}
      />
    );
  },

  /**
   *  Make gallery loader
   */
  _makeGalleryLoader() {
    if (!this.props.gallery.loading) return null;

    return <div className="loader" />
  },

  /**
   *  Make gallery error
   */
  _makeGalleryError() {
    if (!this.props.gallery.error) return null;

    return (
      <div className="gallery__error">
        {Lang.get('gallery.error_' + this.props.gallery.error)}
      </div>
    );
  },

  /**
   *  Make gallery
   */
  _makeGallery() {
    var gallery = this.props.gallery;

    if (!gallery.loaded) return null;
    if (gallery.loading) return null;
    if (gallery.error) return null;

    if (!gallery.photos.length) {
      return (
        <div className="gallery__error">
          {Lang.get('gallery.photos_not_found')}
        </div>
      );
    }

    var photos = gallery.photos.map(photo => {
      var url = '/' + this.props.lang + '/gallery/';
      url += photo.id;

      if (gallery.tag) {
        url += '?tag=' + encodeURIComponent(gallery.tag);
      }

      return {
        date:    0,
        ratio:   photo.ratio,
        title:   photo.title,
        desc:    '',
        url:     url,
        preview: photo.preview,
      };
    });

    return (
      <Grid list={photos}/>
    );
  },

  /**
   *  Make gallery paginator
   */
  _makeGalleryPaginator() {
    var gallery = this.props.gallery;

    if (!gallery.loaded) return null;
    if (gallery.loading) return null;
    if (gallery.error) return null;

    var url = '/' + this.props.lang + '/gallery/?';
    if (gallery.tag) url += 'tag=' + encodeURIComponent(gallery.tag) + '&';
    url += 'page=%page%';

    return (
      <div className="pages__paginator">
        <Paginator
          page={gallery.page}
          pages={gallery.pages}
          url={url}
        />
      </div>
    );
  },

  render() {
    return (
      <Wrapper>

        <div className="gallery__tags-wrapper">
          <div className="gallery__tags">
            {this._makeTagGroups()}
          </div>
        </div>

        <div className="gallery__grid-wrapper">
          <div className="gallery__grid">
            {this._makeGalleryLoader()}
            {this._makeGalleryError()}
            {this._makeGallery()}
            {this._makeGalleryPaginator()}
          </div>
        </div>

        <div className="floating-clear" />
      </Wrapper>
    );
  }
});

SiteGallery.fetchData = (store, params) => {
  return [
    store.dispatch(loadGallery(
      params.page ? params.page : 1,
      params.tag ? params.tag : ''
    )),

    store.dispatch(loadTags(
      ['category', 'camera', 'lens']
    ))
  ];
}

function mapStateToProps(state) {
  var tags = {};

  if (state.tags.lens) {
    tags = {
      category: state.tags.category,
      camera:   state.tags.camera,
      lens:     state.tags.lens,
    }
  }

  return {
    lang:    state.lang,
    gallery: state.gallery,
    tags,
  }
}

module.exports = connect(mapStateToProps)(SiteGallery);