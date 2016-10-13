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