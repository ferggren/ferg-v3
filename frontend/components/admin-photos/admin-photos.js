var React          = require('react');
var PhotoLibrary   = require('components/photo-library/');
var ContentWrapper = require('components/view/content-wrapper');
var PopupWindow    = require('components/popup-window');
var Request        = require('libs/request');
var Popups         = require('libs/popups-nice');

require('styles/partials/loader');

var AdminPhotos = React.createClass({
  _request: false,

  getInitialState() {
    return {
      loading: false,
    }
  },

  componentWillUnmount() {
    if (this._request) {
      Request.abort(this._request);
      this._request = false;
    }
  },

  _loadPhoto(photo_id) {
    photo_id = photo_id[0];

    if (this._request) {
      Request.abort(this._request);
      this._request = false;
    }

    this._request = Request.fetch(
      '/api/adminphotos/getPhotoUrl', {
        success: (photo) => {

          this._request = false;
          this.setState({loading: false});

          var win = window.open(
            photo.link_download,
            '_blank'
          );
          
          win.focus();
        },

        error: error => {
          Popups.createPopup({content: error});

          this._request = false;
          this.setState({loading: false});
        },

        data: {
          photo_id,
        }
      }
    );

    this.setState({loading: true});
  },

  render() {
    var loader = null;

    if (this.state.loading) {
      loader = (
        <PopupWindow onClose={() => {}}>
          <div className="loader" />
        </PopupWindow>
      );
    }
    return (
      <ContentWrapper>
        {loader}

        <PhotoLibrary
          multiple={false}
          onSelect={this._loadPhoto}
        />
      </ContentWrapper>
    );
  }
});

module.exports = AdminPhotos;