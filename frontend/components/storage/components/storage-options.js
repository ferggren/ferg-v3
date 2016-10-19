var React   = require('react');
var Media   = require('./storage-options-media.js');
var OrderBy = require('./storage-options-orderby.js');

var Options = React.createClass({
  render() {
    return (
      <div className="storage__options-wrapper">
        <div className="storage__options">
          <OrderBy
            onOptionChange={this.props.onOptionChange}
            orderby={this.props.orderby}
          />

          <div className="storage__options-spacing" />

          <Media
            onOptionChange={this.props.onOptionChange}
            media={this.props.media}
            mediaTypes={this.props.mediaTypes}
          />
          
        </div>
      </div>
    );
  }
});

module.exports = Options;