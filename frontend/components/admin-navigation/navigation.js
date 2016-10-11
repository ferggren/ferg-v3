/**
 * @file Provides navigation menu for admin panel
 * @name AdminMenu
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React       = require('react');
var Navigation  = require('components/view/navigation');
var Lang        = require('libs/lang');

Lang.exportStrings(
  'nav',
  require('./navigation.' + Lang.getLang() + '.js')
);

var navagation_links = [
  {
    name:  Lang.get('nav.photos'),
    match: /^\/(?:ru|en)\/admin\/photos\//,
    align: 'left',
    link:  '/' + Lang.getLang() + '/admin/photos/',
  },
  {
    name:  Lang.get('nav.notes'),
    match: /^\/(?:ru|en)\/admin\/notes\//,
    align: 'left',
    link:  '/' + Lang.getLang() + '/admin/notes/',
  },
  {
    name:  Lang.get('nav.moments'),
    match: /^\/(?:ru|en)\/admin\/moments\//,
    align: 'left',
    link:  '/' + Lang.getLang() + '/admin/moments/',
  },
  {
    name:  Lang.get('nav.portfolio'),
    match: /^\/(?:ru|en)\/admin\/portfolio\//,
    align: 'left',
    link:  '/' + Lang.getLang() + '/admin/portfolio/',
  },
  {
    name:  Lang.get('nav.storage'),
    match: /^\/(?:ru|en)\/admin\/storage\//,
    align: 'left',
    link:  '/' + Lang.getLang() + '/admin/storage/',
  },
  {
    name:  Lang.get('nav.home'),
    match: /^\$/,
    align: 'right',
    link:  '/',
  },
];

module.exports = React.createClass({
  render() {
    return (
      <Navigation links={navagation_links} />
    );
  }
});