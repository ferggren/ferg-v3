/**
 * @file Storage uploads list
 * @name Uploads
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React = require('react');

var Uploads = React.createClass({
  render() {
    if (!this.props.uploads.length) {
      return null;
    }
    
    return (
      <div className="storage__uploader">
        Uploads
      </div>
    );
  }
});

module.exports = Uploads;