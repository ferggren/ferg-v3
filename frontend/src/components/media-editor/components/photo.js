/**
 * @file Photo Component for Photos
 * @name Photo
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React = require('react');
var Lang   = require('libs/lang');

var Photo = React.createClass({
  _loading:   false,
  _deleted:   false,

  getInitialState() {
    return {
      show_tags: false,
    }
  },

  shouldComponentUpdate(nextProps, nextState) {
    if (this._loading != nextProps.photo.loading) {
      return true;
    }

    if (this._deleted != nextProps.photo.deleted) {
      return true;
    }

    if (this.state.show_tags != nextState.show_tags) {
      return true;
    }

    return false;
  },

  _insertTag(tag, photo) {
    tag  = '<' + tag + ' ';
    tag += 'id=' + photo.id + ' ';
    tag += 'file="' + photo.name + '" ';
    tag += 'desc="" ';
    tag += '/>'

    this.setState({show_tags: false});
    this.props.onTagSelect(tag);
  },

  _showTags() {
    this.setState({show_tags: true});
  },

  _hideTags() {
    this.setState({show_tags: false});
  },

  _swapTags() {
    this.setState({show_tags: !this.state.show_tags});
  },

  render() {
    var photo = this.props.photo;

    this._deleted = photo.deleted;
    this._loading = photo.loading;

    var remove  = null;
    var restore = null;
    var loader  = null;
    var buttons = null;

    // loading
    if (photo.loading) {
      loader = <div className="media-editor__photo-loader loader-tiny" />
    }

    // restore
    if (!photo.loading && photo.deleted) {
      restore = (
        <div
          className="media-editor__photo-button media-editor__photo-button--restore"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();

            this.props.onRestore(photo);
          }}>
          {Lang.get('media-editor.photo_restore')}
        </div>
      );
    }

    // buttons
    if (this.state.show_tags && !photo.loading && !photo.deleted) {
      buttons = [
        {name: "img", tag: "Photo"},
        {name: "<", tag: "PhotoLeft"},
        {name: ">", tag: "PhotoRight"},
        {name: "-", tag: "PhotoGrid"},
        {name: "pl", tag: "PhotoParallax"},
      ];

      buttons = buttons.map(button => {
        return (
          <div
            key={button.tag}
            className="media-editor__photo-button media-editor__photo-tag"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();

              this._insertTag(button.tag, photo);
            }}>
            {button.name}
          </div>
        );
      });
    }

    // delete
    if (!photo.loading && !photo.deleted) {
      remove = (
        <div
          className="media-editor__photo-button media-editor__photo-button--delete"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();

            this.props.onDelete(photo);
          }}>
          {Lang.get('media-editor.photo_delete')}
        </div>
      );
    }

    return (
      <div
        className="media-editor__photo"
        style={{backgroundImage: "url('" + photo.preview +"')"}}
        onClick={e => {
          this._swapTags();
        }}
        onMouseEnter={e => {
          this._showTags();
        }}
        onMouseLeave={e => {
          this._hideTags();
        }}>
        <div className="media-editor__photo-tags">
          {buttons}
        </div>
        <div className="media-editor__photo-button media-editor__photo-button--title">
          {photo.name}
        </div>
        {remove}
        {restore}
        {loader}
      </div>
    );
  }
});

module.exports = Photo;