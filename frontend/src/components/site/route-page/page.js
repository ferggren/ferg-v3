/**
 * @file Site Page
 * @name SitePage
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React   = require('react');
var Wrapper = require('components/site/view-wrapper');

require('styles/partials/loader');

var SitePage = React.createClass({
  render() {
    return (
      <Wrapper>Page {this.props.type}</Wrapper>
    );
  }
});

module.exports = SitePage;