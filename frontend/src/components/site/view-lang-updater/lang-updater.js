/**
 *  Update page lang
 */

var React       = require('react');
var { connect } = require('react-redux');
var { setLang } = require('redux/actions/lang');
var Lang        = require('libs/lang');

var LangUpdater = React.createClass({
  shouldComponentUpdate(nextProps, nextState) {
    return false;
  },

  componentDidMount() {
    var lang = this._getLang(this.props.location);

    if (lang == this.props.lang) {
      return;
    }

    this.props.dispatch(setLang(lang));
    Lang.setLang(lang);
  },

  componentWillReceiveProps(next_props) {
    var lang = this._getLang(next_props.location);

    if (!lang) {
      return;
    }

    if (lang == next_props.lang) {
      return;
    }

    if (lang == this.props.lang) {
      return;
    }

    this.props.dispatch(setLang(lang));
    Lang.setLang(lang);
  },

  _getLang(location) {
    var match = location.match(/^[\/]?(ru|en)\//);

    if (!match) {
      return false;
    }

    return match[1];
  },

  render() {
    return null;
  }
});

var mapStateToProps = state => {
  return {
    lang:     state.lang,
    location: state.location,
  }
}

module.exports = connect(mapStateToProps)(LangUpdater);