/**
 * @file Tags Cloud
 * @name TagsCloud
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React    = require('react');
var Lang     = require('libs/lang');
var Request  = require('libs/request');
var { Link } = require('react-router');

require('./style.scss');

var TagsCloud = React.createClass({
  _selected: false,
  _tags:     false,

  /**
   *  Only when tags & selected is changed
   */
  shouldComponentUpdate(nextProps, nextState) {
    if (this._selected != nextProps.selected)   {
      return true;
    }

    if (this._tags != this._pack(nextProps.tags)) {
      return true;
    }

    return false;
  },

  /**
   *  Pack object into string
   */
  _pack(tags) {
    var str = [];

    for (var tag in tags) {
      str.push(tag + '=' + tags[tag]);
    }

    return str.join(';');
  },

  /**
   *  Calculate tags size
   */
  _calcTagsSize(tags) {
    var tags_count      = Object.keys(tags);
    var tags_max_amount = 0;
    var tags_amounts    = [];
    var ret             = [];

    if (!tags_count) {
      return [];
    }

    for (var tag in tags) {
      var amount = tags[tag];

      tags_amounts.push(amount);
      tags_max_amount = Math.max(amount, tags_max_amount);
    }

    if (tags_count > 3) {
      tags_amounts.sort((a, b) => {return a - b});
      var offset = Math.floor(tags_count * 0.85) - 1;
      tags_max_amount = tags_amounts[offset];
    }

    var em_max_gain = 0.5;
    var em_base     = 0.7;

    for (var tag in tags) {
      var amount = tags[tag];
      var size   = em_base;

      if (amount > 1) {
        var c  = Math.min(amount, tags_max_amount) / tags_max_amount;
        var em = em_base + em_max_gain * c;
        size   = Math.round(em * 100) / 100;
      }

      ret.push({
        tag:  tag,
        size: size,
      });
    }

    return ret;
  },

  render() {
    this._tags     = this._pack(this.props.tags);
    this._selected = this.props.selected;
    
    var tags  = this._calcTagsSize(this.props.tags);
    var cloud = [];

    cloud = tags.map(tag => {
      var className = "";

      var props = {
        key:       tag.tag,
        style:     { fontSize: tag.size+"em" },
        className: "tags-cloud__tag",
      }

      if (this.props.selected == tag.tag) {
        props.className += " tags-cloud__tag--selected";
      }

      if (this.props.onSelect) {
        props.onClick = e => {
          e.preventDefault();
          this.props.onSelect(this.props.group, tag.tag)
        }
      }

      if (this.props.url) {
        props.to = this.props.url.replace('%tag%', encodeURIComponent(tag.tag));
      }

      if (this.props.url_selected && this.props.selected == tag.tag) {
        props.to = this.props.url_selected.replace('%tag%', encodeURIComponent(tag.tag));
      }

      return (
        <Link {...props}>{tag.tag}</Link>
      );
    });

    return (
      <div className="tags-cloud">{cloud}</div>
    );
  }
});

module.exports = TagsCloud;