/**
 * @file Storage options
 * @name Options
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

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
            media_types={this.props.media_types}
            media_stats={this.props.media_stats}
          />
          
        </div>
      </div>
    );
  }
});

module.exports = Options;