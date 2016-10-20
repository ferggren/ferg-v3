var React = require('react');
var Lang  = require('libs/lang');

var Media = React.createClass({
  shouldComponentUpdate(nextProps) {
    if (nextProps.media !== this.props.media) {
      return true;
    }

    var len = Object.keys(this.props.mediaStats).length;
    var len_next = Object.keys(nextProps.mediaStats).length

    if (len != len_next) {
      return true;
    }

    for (var media in nextProps.mediaStats) {
      if (nextProps.mediaStats[media] != this.props.mediaStats[media]) {
        return true;
      }
    }

    return false;
  },

  render() {
    var stats = this.props.mediaStats;
    var total = 0;

    for (var key in stats) {
      if (key == 'all') continue;
      total += stats[key];
    }

    stats.all = total;

    var media = this.props.mediaTypes.map((media) => {
      var className = "storage__option storage__option--media-" + media;

      var amount = null;
      if (stats[media] && stats[media] > 0) {
        amount = <span>{stats[media]}</span>;
      }
      
      if (media == this.props.media) {
        className += ' storage__option--selected';
      }

      return (
        <a
          key={media}
          className={className}
          onClick={() => {this.props.onOptionChange("media", media)}}
        >
          {Lang.get('storage.media_' + media)}
          {amount}
        </a>
      );
    }, this);

    return (
      <div className="storage__options-group storage__options-group--media">
        {media}
      </div>
    );
  }
});

module.exports = Media;