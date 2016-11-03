/**
 * @file Langs Component for MediaEditor
 * @name Langs
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React = require('react');
var Lang  = require('libs/lang');

var Langs = React.createClass({
  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.lang != this.props.lang) {
      return true;
    }

    return false;
  },

  render() {
    var langs = this.props.langs.map(lang => {
      var class_name = "media-editor__lang";

      if (lang == this.props.lang) {
        class_name += " media-editor__lang--selected";
      }

      return (
        <div
          key={lang}
          className={class_name}
          onClick={e => {
            e.preventDefault();
            this.props.onSelect(lang);
          }}
        >
          {Lang.get('media-editor.lang_' + lang)}
        </div>
      );
    });

    return (
      <div className="media-editor__langs">
        {langs}
      </div>
    );
  }
});

module.exports = Langs;