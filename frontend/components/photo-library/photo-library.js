/**
 * @file Photo Library
 * @name PhotoLibrary
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React     = require('react');
var Lang      = require('libs/lang');
var Request   = require('libs/request');
var Storage   = require('components/storage/');
var Paginator = require('components/paginator');
var TagsCloud = require('components/tags-cloud');

require('./photo-library.scss');
require('styles/partials/floating_clear');
require('styles/partials/loader');

var PhotoLibrary = React.createClass({
  /** Requests list **/
  _requests: {},

  getInitialState() {
    return {
      photos:  [],
      loading: false,
      groups:  [],
      group:   false,
      page:    1,
      pages:   1,
    };
  },

  /**
   *  Load photos
   */
  componentDidMount() {
    this._loadPhotos();
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
    }

    this._requests = {};
  },

  /**
   *  File uploaded in storage
   */
  _onPhotoUpload(photo) {
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
        group:   this.state.group ? this.state.group : 0,
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

    if (this.state.group != photo.group_id) {
      return;
    }

    var photos = this.state.photos;
    photos.unshift(photo);

    this.setState(photos);
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
        group: this.state.group ? this.state.group : '',
        page:  this.state.page,
      }
    });
  },

  /**
   * Select new page
   */
  _onPageSelect(page) {
    if (this.state.loading) {
      if (!this._requests.load_photos) {
        return;
      }

      Request.abort(this._requests.load_photos);
      delete this._requests.load_photos;
    }

    this.setState({page: page, loading: false}, this._loadPhotos);
  },

  render() {
    var photos    = null;
    var loader    = null;
    var paginator = null;

    if (this.state.loading) {
      loader = (
        <div className="loader" />
      );
    }
    else {
      photos = Lang.get('photolibrary.photos_not_found');

      paginator = (
        <Paginator
          page={this.state.page}
          pages={this.state.pages}
          onSelect={this._onPageSelect}
        />
      );
    }

    return (
      <div>
        <Storage 
          onFileUpload={this._onPhotoUpload}
          mediaTypes="image"
          group="photolibrary"
          mode="uploader"
          file_access="private"
        />

        <div className="photolibrary__options-wrapper">
          <div className="photolibrary__options">

            <div>Groups</div>
            <div className="photolibrary__options-spacing" />

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
            {photos}
            {loader}
            {paginator}
          </div>
        </div>

        <div className="floating-clear" />
      </div>
    );
  }
});

module.exports = PhotoLibrary;