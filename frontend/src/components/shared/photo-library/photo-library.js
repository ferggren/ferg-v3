/**
 * @file Photo Library
 * @name PhotoLibrary
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React        = require('react');
var Lang         = require('libs/lang');
var Request      = require('libs/request');
var Popups       = require('libs/popups-nice');
var Photo        = require('./components/photo.js');
var Cover        = require('./components/cover.js');
var Collections  = require('./components/collections.js');
var ButtonAttach = require('./components/button-attach.js');
var Tags         = require('./components/tags.js');
var PhotoEditor  = require('./components/editor.js');
var Storage      = require('components/shared/storage/');
var Paginator    = require('components/shared/paginator');

require('./style.scss');
require('styles/partials/floating_clear');
require('styles/partials/loader');

Lang.exportStrings('photolibrary', require('./lang/ru.js'), 'ru');
Lang.exportStrings('photolibrary', require('./lang/en.js'), 'en');

var PhotoLibrary = React.createClass({
  /** Requests list **/
  _requests: {},

  getInitialState() {
    return {
      photos:         [],
      loading:        false,
      collections:    [],
      collection:     0,
      page:           1,
      pages:          1,
      selected:       {},
      tags:           {},
      tags_selected:  {},
      editor_photo:   false,
      editor_loading: false,
      editor_error:   false,
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
   *  Load tags
   */
  _loadTags() {
    var collection = this.state.collection;
    var request  = 'tags_' + collection;

    if (this._requests[request]) {
      Request.abort(this._requests[request]);

      this._requests[request] = null;
      delete this._requests[request];
    }

    this._requests[request] = Request.fetch(
      '/api/photolibrary/getTags/', {
      success: collection_tags => {
        var tags = this.state.tags;
        tags[collection] = collection_tags;

        this.setState(tags)

        this._requests[request] = null;
        delete this._requests[request];
      },

      error: error => {
        this._requests[request] = null;
        delete this._requests[request];
      },

      data: {
        collection
      }
    });
  },

  /**
   *  Select tag
   */
  _selectTag(tag, value) {
    var tags = this.state.tags_selected;

    if (typeof tags[tag] != 'undefined' && tags[tag] == value) {
      tags[tag] = null;
      delete tags[tag];
    }
    else {
      tags[tag] = value;
    }

    this.setState({
      tags_selected: tags,
    }, this._loadPhotos);
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

        collections.sort(function(a, b) {
          return parseInt(b.updated) - parseInt(a.updated);
        });

        collections.push({
          id:      -1,
          name:    Lang.get('photolibrary.collection_add'),
          updated: 0,
        });

        collections.push({
          id:      0,
          name:    Lang.get('photolibrary.photos_all'),
          updated: 0,
        });

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

  /**
   *  Select collection
   */
  _selectCollection(collection) {
    if (typeof collection != 'object') {
      var found = false;

      for (var i in this.state.collections) {
        if (this.state.collections[i].id != collection) {
          continue;
        }

        collection = this.state.collections[i];
        found = true;
        break;
      }

      if (!found) {
        return;
      }
    }

    if (collection.id == this.state.collection) {
      return;
    }

    if (collection.id == -1) {
      return this._editCollection(collection);
    }

    var id = !collection.deleted ? collection.id : 0;

    this.setState({
      collection:    id,
      page:          1,
      pages:         1,
      tags_selected: {},
    }, () => {
      this._loadPhotos();
      this._loadTags();
    });
  },

  /**
   *  Toggle collection editing
   */
  _editCollection(collection) {
    collection.editing = true;
    collection.name_edit = collection.id == -1 ? "" : collection.name;
    this.forceUpdate();
  },

  /**
   *  Abort collection editing
   */
  _abortEditCollection(collection) {
    collection.editing = false;
    this.forceUpdate();
  },

  /**
   *  Update collection title
   */
  _updateCollection(collection, collection_name) {
    if (collection.id == -1) {
      return this._createCollection(collection, collection_name);
    }

    collection.loading = true;

    var request_id = Request.fetch(
      '/api/photolibrary/updateCollection', {
      success: () => {
        collection.loading = false;
        collection.editing = false;
        collection.name = collection_name;

        this.forceUpdate();

        this._requests[request_id] = null;
        delete this._requests[request_id];
      },

      error: error => {
        Popups.createPopup({content: Lang.get('photolibrary.' + error)});

        collection.loading = false;
        this.forceUpdate();

        this._requests[request_id] = null;
        delete this._requests[request_id];
      },

      data: {
        name: collection_name,
        id: collection.id,
      }
    });

    this._requests[request_id] = request_id;
    this.forceUpdate();
  },

  /**
   *  Create new collection
   */
  _createCollection(collection, collection_name) {
    collection.loading = true;

    var request_id = Request.fetch(
      '/api/photolibrary/createCollection', {
      success: new_collection => {
        collection.loading = false;
        collection.editing = false;

        var collections = this.state.collections;
        collections.push(new_collection);

        collections.sort(function(a, b) {
          return parseInt(b.updated) - parseInt(a.updated);
        });

        this.setState({collections});
        this._selectCollection(new_collection)

        this._requests[request_id] = null;
        delete this._requests[request_id];
      },

      error: error => {
        Popups.createPopup({content: Lang.get('photolibrary.' + error)});

        collection.loading = false;
        this.forceUpdate();

        this._requests[request_id] = null;
        delete this._requests[request_id];
      },

      data: {
        name: collection_name,
      }
    });

    this._requests[request_id] = request_id;
    this.forceUpdate();
  },

  /**
   *  Delete collection
   */
  _deleteCollection(collection) {
    collection.loading = true;

    var request_id = Request.fetch(
      '/api/photolibrary/deleteCollection', {
      success: () => {
        collection.loading = false;
        collection.deleted = true;
        this.forceUpdate()

        if (collection.id == this.state.collection) {
          this._setCollection(collection);
        }

        this._requests[request_id] = null;
        delete this._requests[request_id];
      },

      error: error => {
        Popups.createPopup({content: Lang.get('photolibrary.' + error)});

        collection.loading = false;
        this.forceUpdate();

        this._requests[request_id] = null;
        delete this._requests[request_id];
      },

      data: {
        id: collection.id,
      }
    });

    this._requests[request_id] = request_id;
    this.forceUpdate();
  },

  /**
   *  Restore collection
   */
  _restoreCollection(collection) {
    collection.loading = true;

    var request_id = Request.fetch(
      '/api/photolibrary/restoreCollection', {
      success: () => {
        collection.loading = false;
        collection.deleted = false;

        this.forceUpdate()

        this._requests[request_id] = null;
        delete this._requests[request_id];
      },

      error: error => {
        Popups.createPopup({content: Lang.get('photolibrary.' + error)});

        collection.loading = false;
        this.forceUpdate();

        this._requests[request_id] = null;
        delete this._requests[request_id];
      },

      data: {
        id: collection.id,
      }
    });

    this._requests[request_id] = request_id;
    this.forceUpdate();
  },

  /**
   *  Update collection stats
   */
  _updateCollectionStats(update) {
    var updated = false;

    if (typeof update != 'object') {
      return;
    }

    for (var collection in this.state.collections) {
      collection = this.state.collections[collection];

      if (collection.id != update.id) {
        continue;
      }

      collection.photos  = update.photos;
      collection.cover   = update.cover;
      collection.updated = update.updated;

      updated = true;
      break;
    }

    if (!updated) {
      return;
    }

    this.state.collections.sort(function(a, b) {
      return parseInt(b.updated) - parseInt(a.updated);
    });

    this.forceUpdate();
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

    var data = {
      collection: this.state.collection ? this.state.collection : '',
      page:       this.state.page,
    };

    if (Object.keys(this.state.tags_selected).length) {
      data.tags = true;
    }

    for (var tag in this.state.tags_selected) {
      data['tag_' + tag] = this.state.tags_selected[tag];
    }

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
        Popups.createPopup({content: Lang.get('photolibrary.' + error)});

        this.setState({loading: false});
        this._requests.load_photos = null;
        delete this._requests.load_photos;
      },

      data
    });
  },

  /**
   *  File uploaded in storage
   */
  _createNewPhoto(photo) {
    var request_id = Request.fetch(
      '/api/photolibrary/addPhoto', {
      success: response => {
        this._addPhoto(response.photo);

        if (response && response.collection) {
          this._updateCollectionStats(response.collection);
        }

        this._requests[request_id] = null;
        delete this._requests[request_id];
      },

      error: error => {
        Popups.createPopup({content: Lang.get('photolibrary.' + error)});

        this._requests[request_id] = null;
        delete this._requests[request_id];
      },

      data: {
        file_id:    photo.id,
        collection: this.state.collection ? this.state.collection : 0,
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
          success: response => {
            photo.loading = false;
            photo.deleted = true;

            if (response && response.collection) {
              this._updateCollectionStats(response.collection);
            }

            this._requests[request] = null;
            delete this._requests[request];

            this.setState({
              photos: this.state.photos,
            });
          },

          error: error => {
            Popups.createPopup({content: Lang.get('photolibrary.' + error)});

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
          success: response => {
            photo.loading = false;
            photo.deleted = false;

            if (response && response.collection) {
              this._updateCollectionStats(response.collection);
            }

            this._requests[request] = null;
            delete this._requests[request];

            this.setState({
              photos: this.state.photos,
            });
          },

          error: error => {
            Popups.createPopup({content: Lang.get('photolibrary.' + error)});

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
  _selectPhoto(photo) {
    if (photo.deleted) {
      return;
    }

    if (typeof this.props.onSelect != 'function') {
      return;
    }

    this.props.onSelect([photo.id]);
  },

  /**
   *  On photos selected -> return all photos
   */
  _attachSelectedPhotos() {
    var photos = Object.keys(this.state.selected);

    if (!photos.length) {
      return;
    }

    if (typeof this.props.onSelect != 'function') {
      return;
    }

    this.props.onSelect(photos);
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
    if (this._requests.update_photo) {
      Request.abort(this._requests.update_photo);

      this._requests.update_photo = null;
      delete this._requests.update_photo;
    }

    this.setState({
      editor_photo:   photo,
      editor_loading: false,
    });
  },

  /**
   *  Close photo editor
   */
  _abortEditPhoto() {
    if (this._requests.update_photo) {
      Request.abort(this._requests.update_photo);

      this._requests.update_photo = null;
      delete this._requests.update_photo;
    }

    this.setState({
      editor_photo:   false,
      editor_loading: false,
    });
  },

  /**
   *  Update photo info
   */
  _updatePhoto(updated_photo, info) {
    var request = 'update_' + updated_photo.id;

    this.state.photos.forEach(photo => {
      if (photo.id != updated_photo.id) {
        return;
      }

      photo.loading = true;
      this._requests[request] = Request.fetch(
        '/api/photolibrary/updatePhoto', {
          success: response => {
            photo.loading = false;

            photo.title_ru = info.title_ru;
            photo.title_en = info.title_en;
            photo.gps      = info.gps;
            photo.taken    = info.taken;

            photo.tags.aperture      = info.tags.aperture;
            photo.tags.shutter_speed = info.tags.shutter_speed;
            photo.tags.camera        = info.tags.camera;
            photo.tags.lens          = info.tags.lens;
            photo.tags.iso           = info.tags.iso;
            photo.tags.category      = info.tags.category;
            photo.tags.fl            = info.tags.fl;
            photo.tags.efl           = info.tags.efl;

            var tags = this.state.tags;
            tags[response.collection] = response.tags;

            this._requests[request] = null;
            delete this._requests[request];

            this.setState({
              photos:         this.state.photos,
              editor_loading: false,
              editor_photo:   false,
              tags,
            });
          },

          error: error => {
            photo.loading = false;

            this._requests[request] = null;
            delete this._requests[request];

            this.setState({
              photos:         this.state.photos,
              editor_loading: false,
              editor_error:   Lang.get('photolibrary.' + error),
            });
          },

          data: {
            id:            photo.id,
            collection:    this.state.collection,
            title_ru:      info.title_ru,
            title_en:      info.title_en,
            gps:           info.gps,
            taken:         info.taken,
            iso:           info.tags.iso,
            shutter_speed: info.tags.shutter_speed,
            aperture:      info.tags.aperture,
            camera:        info.tags.camera,
            lens:          info.tags.lens,
            category:      info.tags.category,
            fl:            info.tags.fl,
            efl:           info.tags.efl,
          }
        }
      );
    });

    this.setState({
      photos:         this.state.photos,
      editor_loading: true,
      editor_error:   false,
    });
  },

  render() {
    var photos      = null;
    var loader      = null;
    var paginator   = null;
    var collections = null;
    var cover       = null;
    var editor      = null;

    // Collections
    if (!this.state.collections.length) {
      collections = (
        <div className="loader" />
      );
    }
    else {
      if (!this.state.collection) {
        collections = (
          <Collections
            collections={this.state.collections}
            default_collections={[0, -1]}
            onCollectionSelect={this._selectCollection}
            onCollectionEdit={this._editCollection}
            onCollectionEditCancel={this._abortEditCollection}
            onCollectionUpdate={this._updateCollection}
            onCollectionDelete={this._deleteCollection}
            onCollectionRestore={this._restoreCollection}
          />
        );
      }
      else {
        for (var collection in this.state.collections) {
          collection = this.state.collections[collection];

          if (!collection.id || collection.id != this.state.collection) {
            continue;
          }

          cover = (
            <Cover
              collection={collection}
              onBack={() => {
                this._selectCollection(0);
              }}
            />
          );
        }
      }
    }

    // photo grid
    photos = this.state.photos.map(photo => {
      return (
        <Photo
          key={photo.id}
          photo={photo}
          multiselect={this.props.multiple}
          selected={typeof this.state.selected[photo.id] != 'undefined'}
          onPhotoDelete={this._deletePhoto}
          onPhotoRestore={this._restorePhoto}
          onPhotoSelect={this._setPhotoSelected}
          onPhotoUnselect={this._setPhotoUnselected}
          onPhotoEdit={this._editPhoto}
          onPhotoClick={this._selectPhoto}
        />
      );
    });

    if (photos.length) {
      photos.push(
        <div key="clear" className="photolibrary__photos-clear" />
      );
    }

    // photos placeholder
    if (!this.state.loading && !this.state.photos.length) {
      photos = (
        <div className="photolibrary__photos-not-found">
          {Lang.get('photolibrary.photos_not_found')}
        </div>
      );
    }

    // loader
    if (this.state.loading) {
      loader = (
        <div className="loader" />
      );
    }

    // paginator
    if (!this.state.loading) {
      paginator = (
        <Paginator
          page={this.state.page}
          pages={this.state.pages}
          onSelect={this._selectPage}
        />
      );
    }

    // editor
    if (this.state.editor_photo && this.state.tags[this.state.collection]) {
      editor = (
        <PhotoEditor
          onClose={this._abortEditPhoto}
          onUpdate={this._updatePhoto}
          photo={this.state.editor_photo}
          loading={this.state.editor_loading}
          error={this.state.editor_error}
          tags={this.state.tags[this.state.collection]}
        />
      );
    }

    return (
      <div>
        {editor}

        <Storage 
          onFileUpload={this._createNewPhoto}
          mediaTypes="image"
          group="photolibrary"
          mode="uploader"
          upload_access="private"
        />

        <div className="photolibrary__tags-wrapper">
          <div className="photolibrary__tags">
            <Tags
              onTagSelect={this._selectTag}
              tags={this.state.tags[this.state.collection]}
              selected={this.state.tags_selected}
            />
          </div>
        </div>

        <div className="photolibrary__photos-wrapper">
          <div className="photolibrary__photos">
            {collections}
            {cover}
            <div className="photolibrary__separator" />
            {photos}
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