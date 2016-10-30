var React          = require('react');
var PhotoLibrary   = require('components/photo-library/');
var ContentWrapper = require('components/view/content-wrapper');
var PopupComponent = require('components/popup-window');
var Request        = require('libs/request');
var PopupWindow    = require('libs/popups-nice');
var Popup          = require('libs/popups');

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

          this._showPhoto(photo);
        },

        error: error => {
          PopupWindow.createPopup({content: error});

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

  _showPhoto(photo) {
    var link = document.createElement('a');

    link.href   = photo.link_download;
    link.target = "_blank";

    var img = document.createElement('img');
    img.src = photo.link_download;
    img.style.maxWidth  = (window.innerWidth - 20) + 'px';
    img.style.maxHeight = (window.innerHeight - 20) + 'px';

    var popup = Popup.createPopup(() => {
      Popup.removePopup(popup.id);
    });

    link.appendChild(img);
    popup.node.appendChild(link);

    Popup.updatePopupsSize();
  },

  render() {
    var loader = null;

    if (this.state.loading) {
      loader = (
        <PopupComponent onClose={() => {}}>
          <div className="loader" />
        </PopupComponent>
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