/**
 *  User tracker
 */

var React       = require('react');
var { connect } = require('react-redux');

var Tracker = React.createClass({
  shouldComponentUpdate(nextProps, nextState) {
    return false;
  },

  componentWillReceiveProps(next_props) {
    if (this.props.location == next_props.location) {
      return;
    }

    if (typeof window == 'undefined') {
      return;
    }

    if (typeof window.ga != 'undefined') {
      ga('set', 'referrer', this.props.location);
      ga('set', 'page', next_props.location);
      ga('send', 'pageview');
    }

    if (typeof window.Ya != 'undefined') {
      var counter = new Ya.Metrika({id: window.__YAID});

      counter.hit(next_props.location, {
        referer: this.props.location
      });
    }
  },

  render() {
    return null;
  }
});

module.exports = connect(state => {return {location: state.location}})(Tracker);