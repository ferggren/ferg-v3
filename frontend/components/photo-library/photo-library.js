/**
 * @file Photo Library
 * @name PhotoLibrary
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React        = require('react');
var Lang         = require('libs/lang');
var Request      = require('libs/request');
var Storage      = require('components/storage/');
var Paginator    = require('components/paginator');
var TagsCloud    = require('components/tags-cloud');
var Photo        = require('./components/photo.js');
var Cover        = require('./components/cover.js');
var Collections  = require('./components/collections.js');
var ButtonAttach = require('./components/button-attach.js');

require('./photo-library.scss');
require('styles/partials/floating_clear');
require('styles/partials/loader');

Lang.exportStrings(
  'photolibrary',
  require('./photolibrary.lang-' + Lang.getLang() + '.js')
);

var PhotoLibrary = React.createClass({
  /** Requests list **/
  _requests: {},

  getInitialState() {
    return {
      photos:      [],
      loading:     false,
      collections: [],
      collection:  0,
      page:        1,
      pages:       1,
      selected:    {},
      tags:        {},
    };
  },

  /**
   *  Load photos
   */
  componentDidMount() {
    this._loadPhotos();
    this._loadTags();
    this._loadCollections();
  },

  /**
   *  Abort any connections
   */
  componentWillUnmount() {
    for (var request in this._requests) {
      if (!this._requests[request]) {
        continue;
      }

      Request.abort(this._requests[request]);
      this._requests[request] = null;
    }

    this._requests = {};
  },

  /**
   *  File uploaded in storage
   */
  _createNewPhoto(photo) {
    var request_id = Request.fetch(
      '/api/photolibrary/addPhoto', {
      success: photo => {
        this._addPhoto(photo);

        this._requests[request_id] = null;
        delete this._requests[request_id];
      },

      error: error => {
        this._requests[request_id] = null;
        delete this._requests[request_id];
      },

      data: {
        file_id: photo.id,
        collection:   this.state.collection ? this.state.collection : 0,
      }
    });

    this._requests[request_id] = request_id;
  },

  /**
   *  Add new photo
   */
  _addPhoto(photo) {
    if (this.state.page != 1) {
      return;
    }

    if (this.state.collection != photo.collection_id) {
      return;
    }

    var photos = this.state.photos;
    photos.unshift(photo);

    this.setState(photos);
  },

  /**
   *  Load tags
   */
  _loadTags() {
    console.log('load tags');
  },

  /**
   *  Load collections
   */
  _loadCollections() {
    if (this._requests.load_collections) {
      Request.abort(this._requests.load_collections);
      delete this._requests.load_collections;
    }

    this._requests.load_collections = Request.fetch(
      '/api/photolibrary/getCollections/', {
      success: collections => {

        this.setState({collections});

        this._requests.load_collections = null;
        delete this._requests.load_collections;
      },

      error: error => {
        this._requests.load_collections = null;
        delete this._requests.load_collections;
      }
    });
  },

  _setCollection(collection_id) {
    console.log('set ', collection_id);
  },

  _addCollection(collection_name) {
    console.log('add ', collection_name);
  },

  _deleteCollection(deleted_collection) {
    console.log('delete ', deleted_collection);
  },

  _restoreCollection(restored_collection) {
    console.log('restore ', restored_collection);
  },

  /**
   *  Load photos
   */
  _loadPhotos() {
    if (this._requests.load_photos) {
      Request.abort(this._requests.load_photos);
      delete this._requests.load_photos;
    }

    this.setState({loading: true});

    this._requests.load_photos = Request.fetch(
      '/api/photolibrary/getPhotos/', {
      success: response => {

        this.setState({
          page:    response.page,
          pages:   response.pages,
          photos:  response.photos,
          loading: false,
        });

        this._requests.load_photos = null;
        delete this._requests.load_photos;
      },

      error: error => {
        this.setState({loading: false});
        this._requests.load_photos = null;
        delete this._requests.load_photos;
      },

      data: {
        collection: this.state.collection ? this.state.collection : '',
        page:  this.state.page,
      }
    });
  },

  /**
   *  Select new page
   */
  _selectPage(page) {
    if (this.state.loading) {
      if (!this._requests.load_photos) {
        return;
      }

      Request.abort(this._requests.load_photos);
      delete this._requests.load_photos;
    }

    this.setState({page: page, loading: false}, this._loadPhotos);
  },

  /**
   *  Select photo
   */
  _setPhotoSelected(photo) {
    var selected = this.state.selected;
    selected[photo.id] = true;

    this.setState(selected);
  },

  /**
   *  Unselect photo
   */
  _setPhotoUnselected(photo) {
    var selected = this.state.selected;

    if (typeof selected[photo.id] == 'undefined') {
      return;
    }

    selected[photo.id] = null;
    delete selected[photo.id];

    this.setState(selected);
  },

  /**
   *  Delete photo
   */
  _deletePhoto(deleted_photo) {
    var request  = 'photo_' + deleted_photo.id;
    var selected = this.state.selected;

    this.state.photos.forEach(photo => {
      if (photo.id != deleted_photo.id) {
        return;
      }

      if (typeof selected[photo.id] != 'undefined') {
        selected[photo.id] = null;
        delete selected[photo.id];
      }

      photo.loading = true;
      this._requests[request] = Request.fetch(
        '/api/photolibrary/deletePhoto', {
          success: () => {
            photo.loading = false;
            photo.deleted = true;

            this._requests[request] = null;
            delete this._requests[request];

            this.setState({
              photos: this.state.photos,
            });
          },

          error: error => {
            photo.loading = false;

            this._requests[request] = null;
            delete this._requests[request];

            this.setState({
              photos: this.state.photos,
            });
          },

          data: {
            photo_id: photo.id,
          }
        }
      );
    });

    this.setState({photos: this.state.photos, selected});
  },

  /**
   *  Restore photo
   */
  _restorePhoto(restored_photo) {
    var request = 'photo_' + restored_photo.id;

    this.state.photos.forEach(photo => {
      if (photo.id != restored_photo.id) {
        return;
      }

      photo.loading = true;
      this._requests[request] = Request.fetch(
        '/api/photolibrary/restorePhoto', {
          success: () => {
            photo.loading = false;
            photo.deleted = false;

            this._requests[request] = null;
            delete this._requests[request];

            this.setState({
              photos: this.state.photos,
            });
          },

          error: error => {
            photo.loading = false;

            this._requests[request] = null;
            delete this._requests[request];

            this.setState({
              photos: this.state.photos,
            });
          },

          data: {
            photo_id: photo.id,
          }
        }
      );
    });

    this.setState({photos: this.state.photos});
  },

  /**
   *  On photo click -> return clicked photo
   */
  _attachPhoto(photo) {
    if (photo.deleted) {
      return;
    }

    if (typeof this.props.onAttach != 'function') {
      return;
    }

    this.props.onAttach([photo.id]);
  },

  /**
   *  On photos selected -> return all photos
   */
  _attachSelectedPhotos() {
    var photos = Object.keys(this.state.selected);

    if (!photos.length) {
      return;
    }

    if (typeof this.props.onAttach != 'function') {
      return;
    }

    this.props.onAttach(photos);
  },

  /**
   *  Clear all photos
   */
  _clearSelectedPhotos() {
    this.setState({selected: {}});
  },

  /**
   *  Show photo editor
   */
  _editPhoto(photo) {
    console.log(photo);
  },

  /**
   *  Update photo info
   */
  _updatePhoto(info) {

  },

  render() {
    var photos      = null;
    var loader      = null;
    var paginator   = null;
    var collections = null;
    var cover       = null;

    if (!this.state.collection) {
      collections = (
        <Collections
          collections={this.state.collections}
          onCollectionSelect={this._setCollection}
          onCollectionCreate={this._addCollection}
          onCollectionDelete={this._deleteCollection}
          onCollectionRestore={this._restoreCollection}
        />
      );
    }
    else {
      cover = (
        <Collection
          onCollectionSelect={this._setCollection}
          onCollectionDelete={this._deleteCollection}
        />
      );
    }

    photos = this.state.photos.map(photo => {
      var selected = typeof this.state.selected[photo.id] != 'undefined';

      return (
        <Photo
          key={photo.id}
          photo={photo}
          selected={selected}
          onPhotoDelete={this._deletePhoto}
          onPhotoRestore={this._restorePhoto}
          onPhotoSelect={this._setPhotoSelected}
          onPhotoUnselect={this._setPhotoUnselected}
          onPhotoEdit={this._editPhoto}
          onPhotoClick={this._attachPhoto}
        />
      );
    });

    if (this.state.loading) {
      loader = (
        <div className="loader" />
      );
    }
    else {
      if (!this.state.photos.length) {
        photos = Lang.get('photolibrary.photos_not_found');
      }

      paginator = (
        <Paginator
          page={this.state.page}
          pages={this.state.pages}
          onSelect={this._selectPage}
        />
      );
    }

    return (
      <div>
        <Storage 
          onFileUpload={this._createNewPhoto}
          mediaTypes="image"
          group="photolibrary"
          mode="uploader"
          upload_access="private"
        />

        <div className="photolibrary__options-wrapper">
          <div className="photolibrary__options">

            <TagsCloud
              group="photo-camera"
            />
            <div className="photolibrary__options-spacing" />

            <TagsCloud
              group="photo-lens"
            />
            <div className="photolibrary__options-spacing" />

            <TagsCloud
              group="photo-iso"
            />
            <div className="photolibrary__options-spacing" />

            <TagsCloud
              group="photo-shutter-speed"
            />
            <div className="photolibrary__options-spacing" />

            <TagsCloud
              group="photo-aperture"
            />
          </div>
        </div>

        <div className="photolibrary__photos-wrapper">
          <div className="photolibrary__photos">
            {collections}
            {cover}
            {photos}
            <div className="floating-clear" />
            <br />
            {loader}
            {paginator}
            <ButtonAttach
              onAbort={this._clearSelectedPhotos}
              onAttach={this._attachSelectedPhotos}
              selected={this.state.selected}
            />
          </div>
        </div>

        <div className="floating-clear" />
      </div>
    );
  }
});

module.exports = PhotoLibrary;