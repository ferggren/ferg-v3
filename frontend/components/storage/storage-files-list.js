var React = require('react');

var FilesList = React.createClass({
  render() {
    var loader = null;
    var files = null;

    if (this.props.loading) {
      loader = <div>LOADING</div>;
    }
    else {
      
    }

    return (
      <div className="storage__files-wrapper">
        <div className="storage__files">
          {loader}
          {files}
        </div>
      </div>
    );
  }
});

module.exports = FilesList;