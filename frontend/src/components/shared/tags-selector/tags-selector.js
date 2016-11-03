/**
 * @file TagsSelector components for PhotoLibrary
 * @name TagsSelector
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React = require('react');
var Lang  = require('libs/lang');

Lang.exportStrings('tags-selector', require('./lang/ru.js'), 'ru');
Lang.exportStrings('tags-selector', require('./lang/en.js'), 'en');

require('./style.scss');

var TagsSelector = React.createClass({
  _values: false,
  _tag:    false,
  _value:  false,

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.show_input != nextState.show_input) {
      return true;
    }

    if (this._values != nextProps.values.join(';')) {
      return true;
    }

    if (this._tag != nextProps.tag) {
      return true;
    }

    if (this._value != nextProps.value) {
      return true;
    }

    return false;
  },

  getInitialState() {
    return {
      show_input: false,
    }
  },

  /**
   *  Remove tag value
   */
  _removeValue(removed_value) {
    if (!this.props.multiple) {
      this.props.onSelect(this.props.tag, '');
      return;
    }

    var values = [];

    this.props.value.split(',').forEach(value => {
      if (!(value = value.trim())) {
        return;
      }

      if (value == removed_value) {
        return;
      }

      values.push(value);
    });

    this.props.onSelect(this.props.tag, values.join(','));
  },

  /**
   *  Set/add tag value
   */
  _setValue(new_value) {
    this.setState({show_input: false});

    if (!this.props.multiple) {
      this.props.onSelect(this.props.tag, new_value);
      return;
    }

    var values = [];

    this.props.value.split(',').forEach(value => {
      if (!(value = value.trim())) {
        return;
      }

      if (value == new_value) {
        return;
      }

      values.push(value);
    });

    values.push(new_value);

    this.props.onSelect(this.props.tag, values.join(','));
  },

  /**
   *  Make select options
   */
  _getSelectOptions() {
    var options = [];

    if (this.props.values.length) {
      options = this.props.values.map(value => {
        return value;
      });

      options.sort();

      options = this.props.values.map(value => {
        return (
          <option
            key={value}
            value={value}>
            {value}
          </option>
        );
      });
    }

    options.unshift(
      <option key="_default" value="_default">{this.props.name}</option>
    );

    options.push(
      <option key="_create" value="_create">{Lang.get('tags-selector.create')}</option>
    );

    return options;
  },

  /**
   *  Set select value as tag
   */
  _addSelectValue() {
    var select = this.refs.value;
    var value  = select.options[select.selectedIndex].value;

    if (value == '_default') {
      return;
    }

    if (value == '_create') {
      this.setState({show_input: true});
      return;
    }

    this._setValue(value);
  },

  render() {
    this._values = this.props.values.join(';');
    this._value  = this.props.value;
    this._tag    = this.props.tag;

    var input    = null;
    var selector = null;
    var spacing  = null;
    var values   = [];

    // tag value(s)
    if (this.props.value) {
      values = [];

      if (this.props.multiple) {
        this.props.value.split(',').forEach(tag => {
          if (!(tag = tag.trim())) {
            return;
          }

          values.push(tag);
        });
      }
      else {
        values.push(this.props.value);
      }

      values = values.map(tag => {
        return (
          <div
            key={tag}
            className="tags-selector__tag"
            onClick={e => {
              this._removeValue(tag);
            }}>
              <div className="tags-selector__tag-name">{this.props.name}</div>
              <div className="tags-selector__tag-value">{tag}</div>
          </div>
        );
      });
    }

    // value selector
    if (!this.state.show_input && (this.props.multiple || !this.props.value)) {
      selector = (
        <select ref="value" value={this.props.tag} onChange={this._addSelectValue}>
          {this._getSelectOptions()}
        </select>
      );
    }

    // new tag input
    if (this.state.show_input && (this.props.multiple || !this.props.value)) {
      input = (
        <form onSubmit={e => {
          e.preventDefault();
          this._setValue(this.refs.new_tag.value);
        }}>
          <input
            type="text"
            ref="new_tag"
          />
        </form>
      );
    }

    // spacing
    if (values.length && (selector || input)) {
      spacing = (
        <br />
      );
    }

    return (
      <div className="tags-selector">
        {values}
        {spacing}
        {selector}
        {input}
      </div>
    );
  }
});

module.exports = TagsSelector;