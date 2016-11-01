/**
 * @file Site Page
 * @name SitePage
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React          = require('react');
var ContentWrapper = require('components/view/content-wrapper');

require('styles/partials/loader');

var SitePage = React.createClass({
  render() {
    return (
      <ContentWrapper>Page {this.props.type}</ContentWrapper>
    );
  }
});

module.exports = SitePage;