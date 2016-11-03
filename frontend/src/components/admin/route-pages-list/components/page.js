/**
 * @file Page Component for PagesList
 * @name Page
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React    = require('react');
var Lang     = require('libs/lang');
var NiceTime = require('libs/nice-time');

require('styles/partials/loader');

var Page = React.createClass({
  _loading: false,
  _deleted: false,
  _visible: false,

  shouldComponentUpdate(nextProps, nextState) {
    if (this._visible != nextProps.page.visible) {
      return true;
    }

    if (this._deleted != nextProps.page.deleted) {
      return true;
    }

    if (this._loading != nextProps.page.loading) {
      return true;
    }

    return false;
  },

  _makeButton(type, callback) {
    var class_name = "pages-list__page-button";
    class_name    += " pages-list__page-button--" + type;

    return (
      <div
        className={class_name}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();

          if (typeof callback == 'function') {
            callback(this.props.page);
          }
        }}>
        {Lang.get('pages-list.page_' + type)}
      </div>
    );
  },

  _makeLoader() {
    return (
      <div className="pages-list__page-loader loader-tiny" />
    );
  },

  _makeVersions() {
    return (
      <div className="pages-list__page-button pages-list__page-versions">
        {this.props.page.versions.join(', ')}
      </div>
    );
  },

  _makeDate() {
    return (
      <div className="pages-list__page-button pages-list__page-date">
        {NiceTime.niceDateFormat(this.props.page.timestamp)}
      </div>
    );
  },

  _makeIcoHidden() {
    return (
      <div className="pages-list__page-hidden" />
    );
  },

  _makeTitle() {
    return (
      <div className="pages-list__page-title">
        {this.props.page.title}
      </div>
    );
  },

  _makeDesc() {
    return (
      <div className="pages-list__page-desc">
        {this.props.page.desc}
      </div>
    );
  },

  render() {
    var page = this.props.page;

    this._loading = page.loading;
    this._deleted = page.deleted;
    this._visible = page.visible;

    var button_delete  = null;
    var button_restore = null;
    var button_show    = null;
    var button_hide    = null;
    var loader         = null;
    var versions       = null;
    var date           = null;
    var ico_hidden     = null;
    var title          = null;
    var desc           = null;

    // title
    if (page.title) {
      title = this._makeTitle();
    }

    // desc
    if (page.desc) {
      desc = this._makeDesc();
    }

    // button delete
    if (!page.deleted && !page.loading) {
      button_delete = this._makeButton(
        "delete",
        this.props.onDelete
      );
    }

    // button restore
    if (page.deleted && !page.loading) {
      button_restore = this._makeButton(
        "restore",
        this.props.onRestore
      );
    }

    // button hide
    if (page.visible && !page.deleted && !page.loading) {
      button_hide = this._makeButton(
        "hide",
        this.props.onHide
      );
    }

    // button show
    if (!page.visible && !page.deleted && !page.loading) {
      button_show = this._makeButton(
        "show",
        this.props.onShow
      );
    }

    // loader
    if (page.loading) {
      loader = this._makeLoader();
    }

    // versions
    if (page.versions.length && !page.loading) {
      versions = this._makeVersions();
    }

    // date
    if (page.date && !page.loading) {
      date = this._makeDate();
    }

    // hidden ico
    if (!page.visible) {
      ico_hidden = this._makeIcoHidden();
    }

    var class_name = "pages-list__page";
    var style      = {};

    if (!page.visible) {
      class_name += " pages-list__page--hidden";
    }

    if (page.deleted) {
      class_name += " pages-list__page--deleted";
    }

    if (page.preview.small) {
      style.backgroundImage = "url('" + page.preview.small + "')";
    }

    return (
      <div
        className={class_name}
        style={style}
        onClick={e => {
          this.props.onSelect(page);
        }}>
        {title}
        {desc}
        {button_delete}
        {button_restore}
        {button_show}
        {button_hide}
        {loader}
        {versions}
        {date}
        {ico_hidden}
      </div>
    );
  },
});

module.exports = Page;