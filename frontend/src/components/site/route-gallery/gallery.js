/**
 * @file Site Gallery
 * @name SiteGallery
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var GALLERY_TAGS_API_KEY = 'gallery_tags';
var GALLERY_TAGS_API_URL = '/api/tags/getTags';
var GALLERY_API_KEY      = 'gallery';
var GALLERY_API_URL      = '/api/gallery/getPhotos';

var React        = require('react');
var { connect }  = require('react-redux');
var { setTitle } = require('redux/actions/title');
var Lang         = require('libs/lang');
var Wrapper      = require('components/site/view-wrapper');
var TagsCloud    = require('components/shared/tags-cloud');
var Grid         = require('components/shared/grid');
var Paginator    = require('components/shared/paginator');

var { makeApiRequest, clearApiData } = require('redux/actions/api');

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
    this._updateGalleryIfNeeded();
    this._loadTagsIfNeeded();
  },

  componentDidUpdate(prevProps, prevState) {
    this._updateTitle();
    this._updateGalleryIfNeeded();
  },

  componentWillUnmount() {
    // this.props.dispatch(clearApiData(GALLERY_API_KEY));
    // this.props.dispatch(clearApiData(GALLERY_TAGS_API_KEY));
  },

  /**
   *  Load gallery tags if needed
   */
  _loadTagsIfNeeded() {
    if (this.props.tags && this.props.tags.options.group == 'gallery') {
      return;
    }

    this.props.dispatch(makeApiRequest(
      GALLERY_TAGS_API_KEY, GALLERY_TAGS_API_URL, {
        group: 'gallery'
      }
    ));
  },

  /**
   *  If needed update gallery photos
   */
  _updateGalleryIfNeeded() {
    var query = this.props.location.query;
    var page  = query.page ? parseInt(query.page) : 1;
    var tag   = query.tag ? query.tag : '';

    if (this.props.photos) {
      var photos = this.props.photos;

      if (photos.loading) return;
      if (!photos.loaded) return;

      var update = false;
      update = update || photos.lang != this.props.lang;
      update = update || photos.options.tag  != tag;
      update = update || photos.options.page != page;

      if (!update) return;
    }

    this.props.dispatch(makeApiRequest(
      GALLERY_API_KEY, GALLERY_API_URL, {
        page,
        tag,
      }
    ));

    var gallery = this.refs.gallery;

    if (!gallery || !gallery.offsetTop || !window.scrollTo || !window.pageYOffset) {
      return;
    }

    if (window.pageYOffset < gallery.offsetTop) {
      return;
    }

    window.scrollTo(0, Math.max(0, gallery.offsetTop - 50));
  },

  /**
   *  Update page title
   */
  _updateTitle() {
    var photos = this.props.photos;
    if (!photos || !photos.options.tag) {
      this.props.dispatch(setTitle(Lang.get('gallery.title')));
      return;
    }

    this.props.dispatch(setTitle(Lang.get(
      'gallery.tag_title', {tag: photos.options.tag}
    )));
  },

  /**
   *  Make tags
   */
  _makeTagsLoader() {
    if (this.props.tags && !this.props.tags.loading) return null;

    return (
      <div className="gallery__loader">
        <div className="loader" />
      </div>
    );
  },

  /**
   *  Make tags
   */
  _makeTagsError() {
    if (!this.props.tags) return null;
    if (!this.props.tags.error) return null;

    return (
      <div className="gallery__error">
        {Lang.get('gallery.error_' + this.props.tags.error)}
      </div>
    );
  },

  /**
   *  Make tags
   */
  _makeTags() {
    if (!this.props.tags) return null;
    if (!this.props.tags.loaded) return null;
    if (this.props.tags.error) return null;

    var url_selected = '/' + this.props.lang + '/gallery/';
    var url_common   = url_selected + '?tag=%tag%';

    return (
      <TagsCloud
        group="gallery"
        tags={this.props.tags.data}
        selected={this.props.photos ? this.props.photos.options.tag : ''}
        url={url_common}
        url_selected={url_selected}
      />
    );
  },

  /**
   *  Make gallery loader
   */
  _makeGalleryLoader() {
    if (this.props.photos && !this.props.photos.loading) return null;

    return <div className="loader" />
  },

  /**
   *  Make gallery error
   */
  _makeGalleryError() {
    if (!this.props.photos) return null;
    if (!this.props.photos.error) return null;

    return (
      <div className="gallery__error">
        {Lang.get('gallery.error_' + this.props.photos.error)}
      </div>
    );
  },

  /**
   *  Make gallery
   */
  _makeGallery() {
    var photos = this.props.photos;

    if (!photos || !photos.data || !photos.data.photos) {
      return null;
    }

    if (!photos.data.photos.length) {
      return (
        <div className="gallery__error">
          {Lang.get('gallery.photos_not_found')}
        </div>
      );
    }

    var tag = photos.options.tag;

    photos = photos.data.photos.map(photo => {
      var url = '/' + this.props.lang + '/gallery/';
      url += photo.id;

      if (tag) {
        url += '?tag=' + encodeURIComponent(tag);
      }

      return {
        type:    'gallery',
        date:    0,
        ratio:   photo.ratio,
        title:   '',
        desc:    '',
        url:     url,
        preview: photo.preview,
      };
    });

    return (
      <div ref="gallery">
        <Grid list={photos}/>
      </div>
    );
  },

  /**
   *  Make gallery paginator
   */
  _makeGalleryPaginator() {
    if (!this.props.photos) return null;
    if (!this.props.photos.loaded) return null;
    if (this.props.photos.error) return null;

    var photos = this.props.photos;


    var url = '/' + this.props.lang + '/gallery/?';
    if (photos.options.tag) url += 'tag=' + encodeURIComponent(photos.options.tag) + '&';
    url += 'page=%page%';

    return (
      <div className="gallery__paginator">
        <Paginator
          page={photos.data.page}
          pages={photos.data.pages}
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
            {this._makeTagsLoader()}
            {this._makeTagsError()}
            {this._makeTags()}
          </div>
        </div>

        <div className="gallery__grid-wrapper">
          <div className="gallery__grid">
            {this._makeGallery()}
            {this._makeGalleryPaginator()}
            {this._makeGalleryLoader()}
            {this._makeGalleryError()}
          </div>
        </div>

        <div className="floating-clear" />
      </Wrapper>
    );
  }
});

SiteGallery.fetchData = (store, params) => {
  var state = store.getState();
  var ret   = [];

  if (!state.api[GALLERY_API_KEY]) {
    ret.push(
      store.dispatch(makeApiRequest(
        GALLERY_API_KEY, GALLERY_API_URL, {
          page:  params.page ? params.page : 1,
          tag:   params.tag ? params.tag : '',
          cache: true,
        }
      ))
    );
  }

  if (!state.api[GALLERY_TAGS_API_KEY]) {
    ret.push(
      store.dispatch(makeApiRequest(
        GALLERY_TAGS_API_KEY, GALLERY_TAGS_API_URL, {
          group: 'gallery',
          cache: true,
        }
      ))
    );
  }

  return ret;
}

function mapStateToProps(state) {
  return {
    lang:   state.lang,
    photos: state.api[GALLERY_API_KEY] ? state.api[GALLERY_API_KEY] : false,
    tags:   state.api[GALLERY_TAGS_API_KEY] ? state.api[GALLERY_TAGS_API_KEY] : false,
  }
}

module.exports = connect(mapStateToProps)(SiteGallery);