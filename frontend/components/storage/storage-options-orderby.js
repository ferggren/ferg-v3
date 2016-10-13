var React = require('react');

var OrderBy = React.createClass({
  shouldComponentUpdate(nextProps) {
    return nextProps.orderby !== this.props.orderby;
  },

  render() {
    var buttons = [
      'latest',
      'popular',
    ];

    buttons = buttons.map((orderby) => {
      var className = "storage__option";
      
      if (orderby == this.props.orderby) {
        className += ' storage__option--selected';
      }

      return (
        <a
          key={orderby}
          className={className}
          onClick={() => {this.props.onOptionChange("orderby", orderby)}}
        >{orderby}</a>
      );
    }, this);

    return (
      <div className="storage__options-group storage__options-group--orderby">
        {buttons}
      </div>
    );
  }
});

module.exports = OrderBy;