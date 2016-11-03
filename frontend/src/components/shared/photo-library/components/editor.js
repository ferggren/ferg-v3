/**
 * @file PhotoEditor components for PhotoLibrary
 * @name PhotoEditor
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React        = require('react');
var Lang         = require('libs/lang');
var TagsSelector = require('components/shared/tags-selector');
var PopupWindow  = require('components/shared/popup-window');

require('styles/partials/loader');
require('styles/partials/floating_clear');

var PhotoEditor = React.createClass({
  _loading: null,
  _error:   false,

  shouldComponentUpdate(nextProps, nextState) {
    if (this._loading != nextProps.loading) {
      return true;
    }
    if (this._error != nextProps.error) {
      return true;
    }

    for (var key in nextState) {
      if (nextState[key] != this.state[key]) {
        return true;
      }
    }

    return false;
  },

  getInitialState() {
    var tags = this.props.photo.tags;

    return {
      tags: {
        iso:           tags.iso,
        aperture:      tags.aperture,
        shutter_speed: tags.shutter_speed,
        camera:        tags.camera,
        lens:          tags.lens,
        category:      tags.category,
        fl:            tags.fl,
        efl:           tags.efl,
      }
    }
  },

  _update() {
    if (this.props.loading) {
      return;
    }

    var info = {
      title_ru: this.refs.title_ru.value,
      title_en: this.refs.title_en.value,
      gps:      this.refs.gps.value,
      taken:    this.refs.taken.value,
      tags:     this.state.tags,
    }

    this.props.onUpdate(this.props.photo, info);
  },

  _selectTag(tag, value) {
    if (this.props.loading) {
      return;
    }

    var tags = this.state.tags;
    tags[tag] = value;

    this.setState(tags);
  },

  render() {
    this._loading = this.props.loading;
    this._error   = this.props.error;

    var photo = this.props.photo;

    var button = null;
    var tags   = [];
    var common = null;
    var loader = null;
    var error  = null;

    // loader
    if (this.props.loading) {
      loader = <div className="loader" />
    }

    // update button
    if (!this.props.loading) {
      button = (
        <div className="photolibrary__editor-update" onClick={this._update}>
          {Lang.get('photolibrary.photo_update')}
        </div>
      );
    }

    //tags select
    tags = [];
    for (var tag in this.props.tags) {
      tags.push(
        <div key={tag}>
          <TagsSelector
            tag={tag}
            name={Lang.get('photolibrary.tag_' + tag)}
            value={this.state.tags[tag]}
            values={Object.keys(this.props.tags[tag])}
            multiple={tag == 'category'}
            onSelect={this._selectTag}
          />
          <div className="photolibrary__editor-tags-spacing" />
        </div>
      );
    }

    var cover_style = {
      backgroundImage: "url('" + photo.preview + "')",
    };

    // error
    if (this.props.error) {
      error = (
        <div className="photolibrary__editor-error">
          {this.props.error}
        </div>
      );
    }

    return (
      <PopupWindow onClose={this.props.onClose}>

        <div className="photolibrary__editor">
          <div className="photolibrary__editor-cover" style={cover_style} />

          {error}

          <div className="photolibrary__editor-tags-wrapper">
            <div className="photolibrary__editor-tags">
              {tags}
            </div>
          </div>

          <div className="photolibrary__editor-info-wrapper">
            <div className="photolibrary__editor-info">
              <form onSubmit={e => {
                e.preventDefault();
                this._update();
              }}>
                <input
                  type="text"
                  ref="title_ru"
                  defaultValue={photo.title_ru}
                  placeholder={Lang.get('photolibrary.photo_title_ru')}
                  disabled={this.props.loading}
                />

                <br />

                <input
                  type="text"
                  ref="title_en"
                  defaultValue={photo.title_en}
                  placeholder={Lang.get('photolibrary.photo_title_en')}
                  disabled={this.props.loading}
                />

                <br />

                <input
                  type="text"
                  ref="gps"
                  defaultValue={photo.gps}
                  placeholder={Lang.get('photolibrary.photo_gps')}
                  disabled={this.props.loading}
                />

                <br />

                <input
                  type="text"
                  ref="taken"
                  defaultValue={photo.taken}
                  placeholder={Lang.get('photolibrary.photo_taken')}
                  disabled={this.props.loading}
                />
              </form>
            </div>
          </div>

          <div className="floating-clear" />

          {button}
          {loader}

        </div>
        
      </PopupWindow>
    );
  }
});

module.exports = PhotoEditor;