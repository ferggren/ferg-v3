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
      300
    );
  },

  componentWillUnmount() {
    if (this._inverval) {
      clearInterval(this.__inverval);
      this._inverval = false;
    }
  },

  _watchProgress() {
    var progress = Request.getTotalProgress();

    var total = parseInt(Math.random() * 99 + 1);

    if (total == this.state.progress) {
      return;
    }

    this.setState({progress: total});
  },

  render() {
    if (this.state.progress <= 0) {
      return null;
    }

    var style = {
      width: this.state.progress + 'px',
    }

    return (
      <div className="request-progress__wrapper">
        <div className="request-progress" style={style}>
          {this.state.progress}
        </div>
      </div>
    );
  }
});

module.exports = RequestProgress;