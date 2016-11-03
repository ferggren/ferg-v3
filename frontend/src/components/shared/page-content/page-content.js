/**
 * @file Page content
 * @name PageContent
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React  = require('react');
var Popups = require('libs/popups');

require('./style.scss');

var PageContent = React.createClass({
  shouldComponentUpdate(nextProps, nextState) {
    return false;    
  },

  _getHTML() {
    return {__html: this.props.content};
  },

  render() {
    return (
      <div className="page" dangerouslySetInnerHTML={this._getHTML()} />
    );
  }
});

module.exports = PageContent;