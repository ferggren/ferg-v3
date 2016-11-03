var React = require('react');
require('./style.scss');

module.exports = React.createClass({
  render() {
    return (
      <div className="site-content">
        <div className="site-content__container">
          {this.props.children}
        </div>
      </div>
    );
  }
});