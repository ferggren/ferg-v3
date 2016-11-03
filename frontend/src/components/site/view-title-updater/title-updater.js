/**
 *  Update page title
 */

var React       = require('react');
var { connect } = require('react-redux');

var TitleUpdater = React.createClass({
  shouldComponentUpdate(nextProps, nextState) {
    return false;
  },

  componentDidMount() {
    if (typeof document != 'undefined') {
      document.title = this.props.title;
    }
  },

  componentWillReceiveProps(next_props) {
    if (this.props.title == next_props.title) {
      return;
    }

    if (typeof document != 'undefined') {
      document.title = next_props.title;
    }
  },

  render() {
    return null;
  }
});

module.exports = connect(state => {return {title: state.title}})(TitleUpdater);