/**
 * @file Photos Grid
 * @name PhotosGrid
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React    = require('react');
var { Link } = require('react-router');
var clone    = require('libs/clone');
var NiceTime = require('libs/nice-time');

require('./style.scss');
require('styles/partials/floating_clear');

var PhotosGrid = React.createClass({
  _makeItem(item) {
    var header = null;
    var title  = null;
    var desc   = null;
    var date   = null;

    var item_props  = {
      to:        item.url,
      className: "photo-grid__item",
      style: {}
    }

    var wrapper_props = {
      key:       item.url,
      className: "photo-grid__item-wrapper",
      style: {
        width: item.width + '%',
      }
    }

    if (item.preview) {
      item_props.style.backgroundImage = "url('" + item.preview + "')";
    }

    if (item.title) {
      title = (
        <h3 className="photo-grid__item-title">
          {item.title}
        </h3>
      );
    }

    if (item.desc) {
      desc = (
        <div className="photo-grid__item-desc">
          {item.desc}
        </div>
      );
    }

    if (title || desc) {
      header = (
        <div className="photo-grid__item-header">
          {title}
          {desc}
        </div>
      );
    }

    if (item.date) {
      date = (
        <div className="photo-grid__item-date">
          {NiceTime.niceDateFormat(item.date)}
        </div>
      );
    }

    return (
      <div {...wrapper_props}>
        <Link {...item_props}>{header}{date}</Link>
      </div>
    );
  },

  _updateWidth(items) {
    if (!items.length) {
      return;
    }

    for (var i = 0; i < items.length; ++i) {
      items[i].width = 100;
    }

    var length    = items.length;
    var position  = 0;
    var ratio_max = 4;

    while (position < length) {
      var ratio = 0;
      var stop = position;

      for (; stop < length; ++stop) {
        if (ratio == 0) {
          ratio += items[stop].ratio;
          continue;
        }

        if (ratio + items[stop].ratio <= ratio_max) {
          ratio += items[stop].ratio;
          continue;
        }

        break;
      }

      var width_left = 100;

      for (;position < stop; ++position) {
        items[position].width = Math.floor((items[position].ratio * 100) / ratio);
        width_left -= items[position].width;
      }

      items[position - 1].width += width_left;
    }
  },

  render() {
    var list = clone(this.props.list);

    this._updateWidth(list);

    var list = list.map(item => {
      return this._makeItem(item);
    });

    return (
      <div className="photo-grid">
        {list}
        <div className="floating-clear" />
      </div>
    );
  }
});

module.exports = PhotosGrid;