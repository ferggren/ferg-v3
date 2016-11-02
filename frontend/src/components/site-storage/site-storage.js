/**
 * @file Site Storage
 * @name SiteStorage
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React          = require('react');
var Storage        = require('components/storage');
var ContentWrapper = require('components/view/content-wrapper');
var Lang           = require('libs/lang');
var { setTitle }   = require('redux/actions/title');
var { connect }    = require('react-redux');

Lang.exportStrings('storage', require('./lang/en.js'), 'en');
Lang.exportStrings('storage', require('./lang/ru.js'), 'ru');

var SiteStorage = React.createClass({
  componentWillMount() {
    Lang.setLang(this.props.lang);
    this._updateTitle();
  },

  componentDidUpdate(prevProps, prevState) {
    Lang.setLang(this.props.lang);
    this._updateTitle();
  },

  _updateTitle() {
    this.props.dispatch(setTitle(Lang.get('storage.title_default')));
  },

  onFileSelect(file) {
    var win = window.open(
      file.link_download,
      '_blank'
    );
    
    win.focus();
  },

  render() {
    return (
      <ContentWrapper>
        <Storage 
          onFileUpload={this.onFileSelect}
          onFileSelect={this.onFileSelect}
          group="storage"
          mediaTypes="all"
        />
      </ContentWrapper>
    );
  },
});

function mapStateToProps(state) {
  return {
    lang: state.lang
  }
}

module.exports = connect(mapStateToProps)(SiteStorage);