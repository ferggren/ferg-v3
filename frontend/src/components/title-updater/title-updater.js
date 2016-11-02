/**
 *  Update page title
 */

var React       = require('react');
var { connect } = require('react-redux');

var TitleUpdater = React.createClass({
  shouldComponentUpdate(next_props) {
    if (this.props.title != next_props.title) {
      return true;
    }

    return false;
  },

  render() {
    if (typeof document != 'undefined') {
      document.title = this.props.title;
    }
    
    return null;
  }
});

module.exports = connect(state => {return {title: state.title}})(TitleUpdater);