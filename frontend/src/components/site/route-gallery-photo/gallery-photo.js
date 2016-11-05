/**
 * @file Gallery Photo
 * @name GalleryPhoto
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React              = require('react');
var { connect }        = require('react-redux');
var { Link }           = require('react-router');
var { browserHistory } = require('react-router');
var { setTitle }       = require('redux/actions/title');
var Lang               = require('libs/lang');
var Wrapper            = require('components/site/view-wrapper');
var TagsCloud          = require('components/shared/tags-cloud');
var { loadPhoto }      = require('redux/actions/photo');

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
    this._loadPhotoIfNeeded();

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
  },

  componentDidUpdate(prevProps, prevState) {
    this._updateTitle();
    this._loadPhotoIfNeeded();

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
    var prev = this.props.photo.prev;
    if (!prev.length) return;
    prev = prev[0].id;

    var url = '/' + this.props.lang + '/gallery/' + prev;
    if (this.props.photo.tag) {
      url += '?tag=' + encodeURIComponent(this.props.photo.tag);
    }

    browserHistory.push(url);
  },

  /**
   *  Navigate to next photo
   */
  _showNextPhoto() {
    var next = this.props.photo.next;
    if (!next.length) return;
    next = next[0].id;

    var url = '/' + this.props.lang + '/gallery/' + next;
    if (this.props.photo.tag) {
      url += '?tag=' + encodeURIComponent(this.props.photo.tag);
    }

    browserHistory.push(url);
  },

  /**
   *  Navigate to gallery
   */
  _showGallery() {
    var url = '/' + this.props.lang + '/gallery/';
    if (this.props.photo.tag) {
      url += '?tag=' + encodeURIComponent(this.props.photo.tag);
    }

    browserHistory.push(url);
  },

  /**
   *  If needed update photo
   */
  _loadPhotoIfNeeded() {
    var photo = this.props.photo;

    if (photo.loading) return;

    var query  = this.props.location.query;
    var params = this.props.params;

    var id    = params.photo_id ? parseInt(params.photo_id) : 0;
    var lang  = this.props.lang;
    var tag   = query.tag ? query.tag : '';

    var update = false;
    update = update || !photo.loaded;
    update = update || photo.tag  != tag;
    update = update || photo.lang != lang;
    update = update || photo.id != id;

    if (!update) return;

    this.props.dispatch(loadPhoto(id, tag));
  },

  /**
   *  Update page title
   */
  _updateTitle() {
    if (!this.props.photo.loaded || this.props.photo.error) {
      this.props.dispatch(setTitle(Lang.get(
        'gallery-photo.default_title'
      )));
    }

    else if (!this.props.photo.info.title) {
      this.props.dispatch(setTitle(Lang.get(
        'gallery-photo.default_title'
      )));
    }

    else {
      this.props.dispatch(setTitle(Lang.get(
        'gallery-photo.title',
        {photo: this.props.photo.info.title}
      )));
    }
  },
  /**
   *  Make photo loader
   */
  _makePhotoLoader() {
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
    if (!this.props.photo.error) return null;

    return (
      <div className="gallery-photo__error">
        {Lang.get('gallery-photo.error_' + this.props.photo.error)}
      </div>
    );
  },

  /**
   *  Make photo preview
   */
  _makePhotoPreview() {
    var photo = this.props.photo;

    if (!photo.loaded) return null;
    if (photo.loading) return null;
    if (photo.error) return null;

    return (
      <a
        href={this.props.photo.info.photo}
        target="_blank"
        className="gallery-photo__header-photo_wrapper"
      >
        <img
          className="gallery-photo__header-photo"
          src={this.props.photo.info.photo}
        />
      </a>
    );
  },

  /**
   *  Make photo navigation
   */
  _makeNavigation() {
    var photo = this.props.photo;

    if (!photo.loaded) return null;
    if (photo.loading) return null;
    if (photo.error) return null;

    var nav = [];

    for (var i in photo.next) nav.unshift(photo.next[i]);
    nav.push(photo.info);
    for (var i in photo.prev) nav.push(photo.prev[i]);

    nav = nav.map(photo => {
      var props = {
        key:       photo.id,
        className: 'gallery-photo__navigation-link',
        style: {
          backgroundImage: "url('" + photo.preview + "')",
        }
      };

      if (photo.id == this.props.photo.id) {
        props.className += ' gallery-photo__navigation-link--current';
      }

      props.to  = '/' + this.props.lang + '/gallery/';
      props.to += photo.id;

      if (this.props.photo.tag) {
        props.to += '?tag=' + encodeURIComponent(this.props.photo.tag);
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
    return (
      <div
        className="gallery-photo__navigation-next"
        onClick={e => {
          this._showNextPhoto();
        }}
      >
        &lt;
      </div>
    );
  },

  /**
   *  Make next photo button
   */
  _makeNavigationPrev() {
    return (
      <div
        className="gallery-photo__navigation-prev"
        onClick={e => {
          this._showPrevPhoto();
        }}
      >
        &gt;
      </div>
    );
  },

  /**
   *  Make photo title
   */
  _makePhotoTitle() {
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

    if (!photo.loaded) return null;
    if (photo.loading) return null;
    if (photo.error) return null;

    var tags = photo.info.tags;

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

    if (!photo.loaded) return null;
    if (photo.loading) return null;
    if (photo.error) return null;

    console.log('tags?');
  },

  render() {
    return (
      <div className="gallery-photo">
        <div className="gallery-photo__header">
            {this._makePhotoLoader()}
            {this._makePhotoError()}
            {this._makePhotoPreview()}
            {this._makeNavigation()}
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
    store.dispatch(loadPhoto(
      params.photo_id ? params.photo_id : 0,
      params.tag ? params.tag : ''
    )),
  ];
}

function mapStateToProps(state) {
  return {
    lang:  state.lang,
    photo: state.photo,
  }
}

module.exports = connect(mapStateToProps)(GalleryPhoto);