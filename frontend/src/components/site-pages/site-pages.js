/**
 * @file Site Pages
 * @name SitePages
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React          = require('react');
var ContentWrapper = require('components/view/content-wrapper');

require('styles/partials/loader');

var SitePages = React.createClass({
  render() {
    return (
      <ContentWrapper>Pages {this.props.type}</ContentWrapper>
    );
  }
});

module.exports = SitePages;