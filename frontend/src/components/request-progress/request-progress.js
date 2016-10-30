var React   = require('react');
var Request = require('libs/request');

require('./request-progress.scss');

var RequestProgress = React.createClass({
  _inverval: false,

  getInitialState() {
    return {
      progress: 0,
    };
  },

  shouldComponentUpdate(next_props, next_state) {
    return this.state.progress != next_state.progress;
  },

  componentDidMount() {
    this._inverval = setInterval(
      this._watchProgress,
      100
    );
  },

  componentWillUnmount() {
    if (this._inverval) {
      clearInterval(this._inverval);
      this._inverval = false;
    }
  },

  _watchProgress() {
    var progress = this._calcProgress(Request.getTotalProgress());

    if (progress == this.state.progress) {
      return;
    }

    this.setState({progress: progress});
  },

  _calcProgress(stats) {
    var progress = 0;

    if (!stats.requests_total) {
      return progress;
    }

    var loaded_progress = 0;
    if (stats.loaded_total) {
      loaded_progress = (stats.loaded * 100) / stats.loaded_total;
    }

    var uploaded_progress = 0;
    if (stats.uploaded_total) {
      uploaded_progress = (stats.uploaded * 100) / stats.uploaded_total;
    }

    progress = loaded_progress * 0.5 + uploaded_progress * 0.5;
    progress /= stats.requests_total;
    progress *= stats.requests_loading;
    progress = 25 + progress * 0.7;
    progress = parseInt(progress);

    return progress;
  },

  render() {
    if (this.state.progress <= 0) {
      return null;
    }

    var style = {
      width: this.state.progress + '%',
    }

    return (
      <div className="request-progress__wrapper">
        <div className="request-progress" style={style}>
          
        </div>
      </div>
    );
  }
});

module.exports = RequestProgress;