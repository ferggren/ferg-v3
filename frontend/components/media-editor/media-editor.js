/**
 * @file Page Editor
 * @name PageEditor
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React       = require('react');
var Lang        = require('libs/lang');
var Request     = require('libs/request');
var Popups      = require('libs/popups-nice');
var PopupWindow = require('components/popup-window');
var Photos      = require('./components/photos');
var Langs       = require('./components/langs');
var PageContent = require('components/page-content');

require('./media-editor.scss');
require('styles/partials/floating_clear');
require('styles/partials/loader');

Lang.exportStrings(
  'media-editor',
  require('./media-editor.lang-' + Lang.getLang() + '.js')
);

var MediaEditor = React.createClass({
  _requests: {},


  getInitialState() {
    var langs = this.props.langs;
    if (typeof langs == 'string') {
      langs = [langs];
    }

    return {
      preview: false,
      entry:   false,
      lang:    langs[0],
      langs:   langs,
      photos:  false,
      error:   false,
      loading: false,
    };
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
   *  Load page
   */
  componentDidMount() {
    this._loadEntry();
    this._loadPhotos();
  },

  /**
   *  Load entry
   */
  _loadEntry() {
    this.setState({
      entry:   false,
      error:   false,
      loading: true,
    });

    this._requests.entry = Request.fetch(
      '/api/media/getEntry/', {
      success: entry => {
        this._requests.entry = null;
        delete this._requests.entry;

        this.setState({
          entry,
          loading: false,
        });
      },

      error: error => {
        this._requests.entry = null;
        delete this._requests.entry;

        this.setState({
          loading: false,
          error: Lang.get('media-editor.error_' + error),
        });
      },

      data: {
        key:  this.props.entry_key,
        lang: this.state.lang,
      }
    });
  },

  /**
   *  Load entry photos
   */
  _loadPhotos() {
    this.setState({
      photos: false,
    });

    this._requests.photos = Request.fetch(
      '/api/media/getPhotos/', {
      success: photos => {
        this._requests.photos = null;
        delete this._requests.photos;

        this.setState({photos});
      },

      error: error => {
        this._requests.photos = null;
        delete this._requests.photos;

        this.setState({
          loading: false,
          error: error,
        });

        Popups.createPopup({
          content: Lang.get('media-editor.error_' + error)
        });
      },

      data: {
        key:  this.props.entry_key,
      }
    });
  },

  /**
   *  Insert tag into editor
   */
  _insertTag(tag_start, tag_end) {
    tag_start = tag_start || '';
    tag_end   = tag_end || '';

    if (this.state.loading) {
      return false;
    }

    if (!this.refs.text) {
      return false;
    }

    var text = this.refs.text.value;

    var select_start = this.refs.text.selectionStart;
    var select_end   = this.refs.text.selectionEnd;

    if (isNaN(select_start)) {
        select_start = select_end = value.length;
    }

    if (!tag_end) {
      text = text.substring(0, select_start) + tag_start + text.substring(select_end, text.length);
    }
    else {
      text = text.substring(0, select_end) + tag_end + text.substring(select_end, text.length);
      text = text.substring(0, select_start) + tag_start + text.substring(select_start, text.length);
    }

    this.refs.text.value = text;

    if (this.refs.text.setSelectionRange) {
      if (!tag_end) {
        this.refs.text.setSelectionRange(
          select_start + tag_start.length,
          select_start + tag_start.length
        );
      }
      else {
        this.refs.text.setSelectionRange(
          select_end + tag_start.length + tag_end.length,
          select_end + tag_start.length + tag_end.length
        );
      }
    }

    return true;
  },

  /**
   *  Make nice indent
   */
  _makeIndent() {
    if (this.state.loading) {
      return false;
    }

    if (!this.refs.text) {
      return false;
    }

    var text = this.refs.text.value;

    var select_start = this.refs.text.selectionStart;

    if (isNaN(select_start)) {
      return false;
    }

    var value    = this.refs.text.value;
    var indents  = 0;
    var position = select_start;

    while (--position >= 0) {
      var char = value.charAt(position);

      if (char == "\r" || char == "\n") {
        break;
      }

      if (char != " ") {
        indents = 0;
        continue;
      }

      ++indents;
    }

    if (!indents) {
      return false;
    }

    this._insertTag("\n" + (new Array(indents + 1).join(' ')));
    return true;
  },

  /**
   *  Add photos
   */
  _addPhotos(photos) {
    this.setState({photos: false});

    this._requests.add_photos = Request.fetch(
      '/api/media/addPhotos/', {
      success: photos => {
        this._requests.add_photos = null;
        delete this._requests.add_photos;

        this.setState({photos});
      },

      error: error => {
        this._requests.add_photos = null;
        delete this._requests.add_photos;

        this._loadPhotos();

        Popups.createPopup({
          content: Lang.get('media-editor.error_' + error)
        });
      },

      data: {
        key:    this.props.entry_key,
        photos: photos.join(','),
      }
    });
  },

  /**
   *  Remove photo
   */
  _deletePhoto(photo) {
    photo.loading = true;
    this.forceUpdate();

    var key = "photo_" + photo.id;

    this._requests[key] = Request.fetch(
      '/api/media/deletePhoto/', {
      success: photos => {
        this._requests[key] = null;
        delete this._requests[key];

        photo.deleted = true;
        photo.loading = false;
        this.forceUpdate();
      },

      error: error => {
        this._requests[key] = null;
        delete this._requests[key];

        photo.loading = false;
        this.forceUpdate();

        Popups.createPopup({
          content: Lang.get('media-editor.error_' + error)
        });
      },

      data: {
        key:      this.props.entry_key,
        photo_id: photo.id,
      }
    });
  },

  /**
   *  Restore photo
   */
  _restorePhoto(photo) {
    this._addPhotos([photo.id]);
  },

  /**
   *  Change lang
   */
  _changeLang(lang) {
    if (this.state.loading) {
      return;
    }

    if (this.state.lang == lang) {
      return;
    }

    this.setState({lang}, this._loadEntry);
  },

  /**
   *  Update entry info
   */
  _updateEntry() {
    var entry = {
      title:   this.refs.title.value,
      desc:    this.refs.desc.value,
      text:    this.refs.text.value,
      visible: !!this.refs.visible.checked,
    };

    this.setState({
      loading: true,
      error: false,
    });

    this._requests.update_netry = Request.fetch(
      '/api/media/updateEntry/', {
      success: () => {
        this._requests.update_netry = null;
        delete this._requests.update_netry;

        this.setState({
          loading: false,
          entry,
        });
      },

      error: error => {
        this._requests.update_netry = null;
        delete this._requests.update_netry;

        this.setState({
          loading: false,
          error:   Lang.get('media-editor.error_' + error)
        });
      },

      data: {
        key:     this.props.entry_key,
        lang:    this.state.lang,
        title:   entry.title,
        desc:    entry.desc,
        text:    entry.text,
        visible: entry.visible ? 'visible' : 'hidden',
      }
    });
  },

  /**
   *  Show entry preview
   */
  _showPreview(entry) {
    this.setState({
      loading: true,
      error: false,
    });

    this._requests.preview_netry = Request.fetch(
      '/api/media/getPreview/', {
      success: (html) => {
        this._requests.preview_netry = null;
        delete this._requests.preview_netry;

        var entry = {
          title:   this.refs.title.value,
          desc:    this.refs.desc.value,
          html:    html,
        };

        this.setState({
          loading: false,
          preview: entry,
        });
      },

      error: error => {
        this._requests.preview_netry = null;
        delete this._requests.preview_netry;

        this.setState({
          loading: false,
          error:   Lang.get('media-editor.error_' + error)
        });
      },

      data: {
        text: this.refs.text.value,
      }
    });
  },

  /**
   *  Close preview
   */
  _closePreview() {
    this.setState({preview: false});
  },

  /**
   *  Make photos selector
   */
  _makePhotos() {
    return (
      <Photos
        photos={this.state.photos}
        onTagSelect={this._insertTag}
        onAttach={this._addPhotos}
        onDelete={this._deletePhoto}
        onRestore={this._restorePhoto}
      />
    );
  },

  /**
   *  Make loader
   */
  _makeLoader() {
    return (
      <div className="loader" />
    );
  },

  /**
   *  Make editor's error
   */
  _makeEditorError() {
    return (
      <div className="media-editor__error">
        {this.state.error}
      </div>
    );
  },

  /**
   *  Make editor
   */
  _makeEditor() {
    return (
      <div className="media-editor__editor">
        <form
          ref="editor"
          onSubmit={e => {
            e.preventDefault();
            this._updateEntry();
          }}>

          <label>
            <input
              type="checkbox"
              ref="visible"
              defaultChecked={this.state.entry.visible}
            />
            {Lang.get('media-editor.entry_visible')}
          </label>

          <input
            disabled={this.state.loading}
            type="text"
            ref="title"
            defaultValue={this.state.entry.title}
            placeholder={Lang.get('media-editor.entry_title')}
          />

          <br />

          <input
            disabled={this.state.loading}
            type="text"
            ref="desc"
            defaultValue={this.state.entry.desc}
            placeholder={Lang.get('media-editor.entry_desc')}
          />

          <br />

          <textarea
            disabled={this.state.loading}
            ref="text"
            defaultValue={this.state.entry.text}
            placeholder={Lang.get('media-editor.entry_text')}
            onKeyDown={e => {
              if (e.keyCode == 9 && this._insertTag("  ")) {
                e.preventDefault();
                e.stopPropagation();
                return false;
              }

              if (e.keyCode == 13 && this._makeIndent()) {
                e.preventDefault();
                e.stopPropagation();
                return false;
              }

              return true;
            }}
          />
        </form>
      </div>
    );
  },

  _makeButtons() {
    return (
      <div className="media-editor__buttons">
        <div className="media-editor__button-wrapper media-editor__button-wrapper--update">
          <div
            className="media-editor__button media-editor__button--update"
            onClick={e => {
              this._updateEntry();
            }}>
            {Lang.get('media-editor.update_entry')}
          </div>
        </div>

        <div className="media-editor__button-wrapper media-editor__button-wrapper--preview">
          <div
            className="media-editor__button media-editor__button--preview"
            onClick={e => {
              this._showPreview();
            }}>
            {Lang.get('media-editor.show_preview')}
          </div>
        </div>
      </div>
    );
  },

  /**
   *  Make lang selector
   */
  _makeLangs() {
    return (
      <Langs
        langs={this.state.langs}
        lang={this.state.lang}
        onSelect={this._changeLang}
      />
    );
  },

  /**
   *  Show preview
   */
  _makePreview() {
    return (
      <PopupWindow onClose={this._closePreview}>
        <PageContent
          content={this.state.preview.html}
          title={this.state.preview.title}
          desc={this.state.preview.desc}
          photo={false}
        />
      </PopupWindow>
    );
  },

  render() {
    var photos        = null;
    var photos_loader = null;
    var editor_loader = null;
    var editor_error  = null;
    var editor        = null;
    var langs         = null;
    var buttons       = null;
    var preview       = null;

    // editor
    if (this.state.entry) {
      editor = this._makeEditor();
    }

    // editor loader
    if (!this.state.entry && this.state.loading) {
      editor_loader = this._makeLoader();
    }

    // editor error
    if (this.state.error) {
      editor_error = this._makeEditorError();
    }

    // editor buttons
    if (this.state.entry && !this.state.loading) {
      buttons = this._makeButtons();
    }

    // photos loader
    if (this.state.photos === false) {
      photos_loader = this._makeLoader();
    }

    // photos
    if (this.state.photos !== false) {
      photos = this._makePhotos();
    }

    // lang select
    if (this.state.langs.length > 1) {
      langs = this._makeLangs();
    }

    if (this.state.preview) {
      preview = this._makePreview();
    }

    return (
      <div className="media-editor">
        {langs}
        {preview}

        <div className="media-editor__photos-wrapper">
          <div className="media-editor__photos">
            {photos_loader}
            {photos}
          </div>
        </div>

        <div className="media-editor__common-wrapper">
          <div className="media-editor__common">
            {editor_error}
            {editor_loader}
            {editor}
            {buttons}
          </div>
        </div>

        <div className="floating-clear" />
      </div>
    );
  }
});

module.exports = MediaEditor;