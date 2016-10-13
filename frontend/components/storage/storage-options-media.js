var React = require('react');

var Media = React.createClass({
  shouldComponentUpdate(nextProps) {
    return nextProps.media !== this.props.media;
  },

  render() {
    var media = this.props.mediaTypes.map((media) => {
      var className = "storage__option storage__option--media-" + media;
      
      if (media == this.props.media) {
        className += ' storage__option--selected';
      }

      return (
        <a
          key={media}
          className={className}
          onClick={() => {this.props.onOptionChange("media", media)}}
        >{media}</a>
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