var React   = require('react');
var Request = require('libs/request');

require('./style.scss');

var RequestProgress = React.createClass({
  _inverval_watch:  false,
  _inverval_update: false,

  getInitialState() {
    return {
      nice_progress: 0,
      real_progress: 0,
    };
  },

  shouldComponentUpdate(next_props, next_state) {
    if (this.state.real_progress != next_state.real_progress) {
      return true;
    }

    if (this.state.nice_progress != next_state.nice_progress) {
      return true;
    }

    return false;
  },

  componentDidMount() {
    this._inverval_watch = setInterval(
      this._watchProgress,
      100
    );

    this._inverval_update = setInterval(
      this._updateProgress,
      20
    );
  },

  componentWillUnmount() {
    if (this._inverval_watch) {
      clearInterval(this._inverval_watch);
      this._inverval_watch = false;
    }
    if (this._inverval_update) {
      clearInterval(this._inverval_update);
      this._inverval_update = false;
    }
  },

  _watchProgress() {
    var real_progress = this._calcProgress(Request.getTotalProgress());

    if (real_progress == this.state.real_progress) {
      return;
    }

    this.setState({
      real_progress,
    });
  },

  _updateProgress() {
    if (this.state.real_progress <= 0) {
      if (this.state.nice_progress > 0) {
        this.setState({nice_progress: 0});
      }

      return;
    }

    var real = this.state.real_progress;
    var nice = this.state.nice_progress;

    var add = 20;

    if ((real - nice) < 5) add = 1;
    else if ((real - nice) < 10) add = 3;
    else if ((real - nice) < 20) add = 5;
    else if ((real - nice) < 30) add = 7;
    else if ((real - nice) < 40) add = 10;

    nice += add;
    nice  = Math.min(nice, real);

    if (nice != this.state.nice_progress) {
      this.setState({nice_progress: nice});
    }
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
    if (this.state.nice_progress <= 0) {
      return null;
    }

    var style = {
      width: this.state.nice_progress + '%',
    }

    return (
      <div className="request-progress__wrapper">
        <div className="request-progress" style={style} />
      </div>
    );
  }
});

module.exports = RequestProgress;