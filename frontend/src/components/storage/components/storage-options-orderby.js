/**
 * @file Storage options orderBy
 * @name OrderBy
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React = require('react');
var Lang  = require('libs/lang');

var OrderBy = React.createClass({
  shouldComponentUpdate(nextProps) {
    //only if orderby is changed
    return nextProps.orderby !== this.props.orderby;
  },

  render() {
    var buttons = [
      'latest',
      'popular',
      'biggest',
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
        >{Lang.get('storage.orderby_' + orderby)}</a>
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