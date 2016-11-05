/**
 * @file Gallery Photo
 * @name GalleryPhoto
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var PHOTO_API_KEY = 'photo';

var React              = require('react');
var { connect }        = require('react-redux');
var { Link }           = require('react-router');
var { browserHistory } = require('react-router');
var { setTitle }       = require('redux/actions/title');
var Lang               = require('libs/lang');
var Wrapper            = require('components/site/view-wrapper');
var TagsCloud          = require('components/shared/tags-cloud');

var { makeApiRequest, clearApiData } = require('redux/actions/api');

Lang.exportStrings('gallery-photo', require('./lang/en.js'), 'en');
Lang.exportStrings('gallery-photo', require('./lang/ru.js'), 'ru');

require('./styles.scss');
require('styles/partials/loader');
require('styles/partials/floating_clear');

var GalleryPhoto = React.createClass({
  componentWillMount() {
    this._updateTitle();
  },

  componentDidMount() {
    this._updateTitle();
    this._updatePhotoIfNeeded();

    if (typeof window != 'undefined' && window.scrollTo) {
      window.scrollTo(0, 0);
    }

    if (typeof document != 'undefined') {
      this._addKeysListner();
    }
  },

  componentWillUnmount() {
    if (typeof document != 'undefined') {
      this._removeKeysListner();
    }

    this.props.dispatch(clearApiData(PHOTO_API_KEY));
  },

  componentDidUpdate(prevProps, prevState) {
    this._updateTitle();
    this._updatePhotoIfNeeded();

    if (prevProps.params.page_id != this.props.params.page_id) {
      if (typeof window != 'undefined' && window.scrollTo) {
        window.scrollTo(0, 0);
      }
    }
  },

  /**
   *  Remove keys watcher
   */
  _removeKeysListner() {
    if (!document.removeEventListener) return;
    document.removeEventListener('keyup', this._watchKey);
  },

  /**
   *  Add keys watcher
   */
  _addKeysListner() {
    if (!document.addEventListener) return;
    document.addEventListener('keyup', this._watchKey);
  },

  /**
   *  Watch key pressed
   */
  _watchKey(e) {
    // next photo
    if (e.keyCode == 37) this._showNextPhoto();

    // prev photo
    if (e.keyCode == 39) this._showPrevPhoto();

    // show gallery
    if (e.keyCode == 27) this._showGallery();

    return true;
  },

  /**
   *  Navigate to prev photo
   */
  _showPrevPhoto() {
    var photo = this.props.photo;

    if (!photo || photo.loading || !photo.data) {
      return;
    }

    var prev = photo.data.prev;

    if (!prev.length) return;
    prev = prev[0].id;

    var url = '/' + this.props.lang + '/gallery/' + prev;
    if (photo.options.tag) {
      url += '?tag=' + encodeURIComponent(photo.options.tag);
    }

    browserHistory.push(url);
  },

  /**
   *  Navigate to next photo
   */
  _showNextPhoto() {
    var photo = this.props.photo;

    if (!photo || photo.loading || !photo.data) {
      return;
    }

    var next = photo.data.next;

    if (!next.length) return;
    next = next[0].id;

    var url = '/' + this.props.lang + '/gallery/' + next;
    if (photo.options.tag) {
      url += '?tag=' + encodeURIComponent(photo.options.tag);
    }

    browserHistory.push(url);
  },

  /**
   *  Navigate to gallery
   */
  _showGallery() {
    var photo = this.props.photo;
    var url   = '/' + this.props.lang + '/gallery/';

    if (photo && photo.options.tag) {
      url += '?tag=' + encodeURIComponent(photo.options.tag);
    }

    browserHistory.push(url);
  },

  /**
   *  If needed update photo
   */
  _updatePhotoIfNeeded() {
    var query  = this.props.location.query;
    var params = this.props.params;

    var id    = params.photo_id ? parseInt(params.photo_id) : 0;
    var lang  = this.props.lang;
    var tag   = query.tag ? query.tag : '';

    if (this.props.photo) {
      var photo = this.props.photo;

      if (photo.loading) return;
      if (!photo.loaded) return;

      var update = false;
        update = update || photo.lang != lang;
        update = update || photo.options.tag  != tag;
        update = update || photo.options.id != id;

      if (!update) return;
    }

    this.props.dispatch(makeApiRequest(
      PHOTO_API_KEY, '/api/gallery/getPhoto', {
        id,
        tag,
      }
    ));
  },

  /**
   *  Update page title
   */
  _updateTitle() {
    if (!this.props.photo || !this.props.photo.loaded || this.props.photo.error) {
      this.props.dispatch(setTitle(Lang.get(
        'gallery-photo.default_title'
      )));
    }

    else if (!this.props.photo.data.title) {
      this.props.dispatch(setTitle(Lang.get(
        'gallery-photo.default_title'
      )));
    }

    else {
      this.props.dispatch(setTitle(Lang.get(
        'gallery-photo.title',
        {photo: this.props.photo.data.title}
      )));
    }
  },
  /**
   *  Make photo loader
   */
  _makePhotoLoader() {
    if (!this.props.photo) return null;
    if (!this.props.photo.loading) return null;

    return (
      <div className="gallery-photo__loader">
        <div className="loader" />
      </div>
    );
  },

  /**
   *  Make photo error
   */
  _makePhotoError() {
    var photo = this.props.photo;

    if (!photo || !photo.error) return null;

    return (
      <div className="gallery-photo__error">
        {Lang.get('gallery-photo.error_' + photo.error)}
      </div>
    );
  },

  /**
   *  Make photo preview
   */
  _makePhotoPreview() {
    var photo = this.props.photo;

    if (!photo) return null;
    if (!photo.data) return null;
    if (photo.error) return null;
    if (!photo.data.info || !photo.data.info.photo) return null;

    photo = photo.data.info.photo;

    return (
      <a
        href={photo}
        target="_blank"
        className="gallery-photo__header-photo_wrapper"
      >
        <img
          className="gallery-photo__header-photo"
          src={photo}
        />
      </a>
    );
  },

  /**
   *  Make photo navigation
   */
  _makeNavigation() {
    var photo = this.props.photo;

    if (!photo) return null;
    if (!photo.data) return null;
    if (photo.error) return null;
    if (!photo.data.info || !photo.data.info.photo) return null;

    var nav = [];

    for (var i in photo.data.next) nav.unshift(photo.data.next[i]);
    nav.push(photo.data.info);
    for (var i in photo.data.prev) nav.push(photo.data.prev[i]);

    nav = nav.map(item => {
      var props = {
        className: 'gallery-photo__navigation-link',
        key:       item.id,
        style: {
          backgroundImage: "url('" + item.preview + "')",
        }
      };

      if (item.id == photo.options.id) {
        props.className += ' gallery-photo__navigation-link--current';
      }

      props.to  = '/' + this.props.lang + '/gallery/';
      props.to += item.id;

      if (photo.options.tag) {
        props.to += '?tag=' + encodeURIComponent(photo.options.tag);
      }

      return (
        <Link {...props} />
      );
    });

    return (
      <div className="gallery-photo__navigation">
        {this._makeNavigationNext()}
        {nav}
        {this._makeNavigationPrev()}
      </div>
    );
  },

  /**
   *  Make next photo button
   */
  _makeNavigationNext() {
    var photo = this.props.photo;

    if (!photo || photo.loading || !photo.data || !photo.data.next.length) {
      return null;
    }

    var next = photo.data.next[0].id;
    var url  = '/' + this.props.lang + '/gallery/' + next;

    if (photo.options.tag) {
      url += '?tag=' + encodeURIComponent(photo.options.tag);
    }

    return (
      <Link className="gallery-photo__navigation-next" to={url}>
        &lt;
      </Link>
    );
  },

  /**
   *  Make next photo button
   */
  _makeNavigationPrev() {
    var photo = this.props.photo;

    if (!photo || photo.loading || !photo.data || !photo.data.prev.length) {
      return null;
    }

    var prev = photo.data.prev[0].id;
    var url  = '/' + this.props.lang + '/gallery/' + prev;

    if (photo.options.tag) {
      url += '?tag=' + encodeURIComponent(photo.options.tag);
    }

    return (
      <Link className="gallery-photo__navigation-prev" to={url}>
        &gt;
      </Link>
    );
  },

  /**
   *  Make photo title
   */
  _makePhotoTitle() {
    var photo = this.props.photo;
    if (!photo || !photo.loaded || photo.error) return null;

    return console.log('_makePhotoTitle');
    var photo = this.props.photo;

    if (!photo.loaded) return null;
    if (photo.loading) return null;
    if (photo.error) return null;
    if (!photo.info.title) return null;

    return (
      <div className="gallery-photo__info-title">
        {photo.info.title}
      </div>
    );
  },


  /**
   *  Make photo info
   */
  _makePhotoDetails() {
    var photo = this.props.photo;
    if (!photo || !photo.loaded || photo.error) return null;

    var tags = photo.data.info.tags;

    var keys = [
      "camera",
      "lens",
      "shutter_speed",
      "aperture",
      "iso",
    ];

    var details = [];

    keys.forEach(key => {
      if (!tags[key]) return;

      details.push(Lang.get(
        'gallery-photo.photo_' + key, {param: tags[key]}
      ));
    });

    if (!details.length) return; null;

    return (
      <div className="gallery-photo__info-details">
        {details.join(', ')}
      </div>
    );
  },

  /**
   *  Make photo tags
   */
  _makePhotoTags() {
    var photo = this.props.photo;
    if (!photo || !photo.loaded || photo.error) return null;

    var category = photo.data.info.tags.category;
    if (!category) return null;

    var tags = {};
    var url  = '/' + this.props.lang + '/gallery/?tag=%tag%';

    category.split(',').forEach(key => {
      tags[key] = 1;
    });

    return (
      <TagsCloud
        group="gallery"
        tags={tags}
        url={url}
      />
    );
  },

  render() {
    return (
      <div className="gallery-photo">
        <div className="gallery-photo__header">
            {this._makePhotoError()}
            {this._makePhotoPreview()}
            {this._makeNavigation()}
            {this._makePhotoLoader()}
        </div>

        <Wrapper>
          <div className="gallery-photo__info">
            {this._makePhotoTitle()}
            {this._makePhotoDetails()}
            {this._makePhotoTags()}
          </div>
        </Wrapper>
      </div>
    );
  }
});

GalleryPhoto.fetchData = (store, params) => {
  if (!params.photo_id || !parseInt(params.photo_id)) {
    return [];
  }

  return [
    store.dispatch(makeApiRequest(
      PHOTO_API_KEY, '/api/gallery/getPhoto', {
        id:  params.photo_id ? params.photo_id : 0,
        tag: params.tag ? params.tag : '',
      }
    ))
  ];
}

function mapStateToProps(state) {
  return {
    lang:  state.lang,
    photo: state.api[PHOTO_API_KEY] ? state.api[PHOTO_API_KEY] : false,
  }
}

module.exports = connect(mapStateToProps)(GalleryPhoto);