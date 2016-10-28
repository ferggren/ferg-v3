/**
 * @file Page Editor
 * @name PageEditor
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React     = require('react');
var Lang      = require('libs/lang');
var Request   = require('libs/request');
var Popups    = require('libs/popups-nice');
var Window    = require('components/popup-window');
var Tags      = require('components/tags-selector');
var Wrapper   = require('components/view/content-wrapper');
var Preview   = require('./components/preview');
var Editor    = require('components/media-editor');

require('./page-editor.scss');
require('styles/partials/floating_clear');
require('styles/partials/loader');

Lang.exportStrings(
  'page-editor',
  require('./page-editor.lang-' + Lang.getLang() + '.js')
);

var PageEditor = React.createClass({
  _requests: {},

  getInitialState() {
    return {
      page:    false,
      type:    this.props.params.page_type,
      id:      this.props.params.page_id,
      tags:    false,
      loading: false,
    }
  },

  /**
   *  Abort any connections
   */
  componentWillUnmount() {
    for (var request in this._requests) {
      if (!this._requests[request]) {
        continue;
      }

      Request.abort(this._requests[request]);
      this._requests[request] = null;
    }

    this._requests = {};
  },

  /**
   *  Load page
   */
  componentDidMount() {
    this._loadPage();
    this._loadTags();
  },

  /**
   *  Load tags
   */
  _loadTags() {
    if (this._requests.tags) {
      Request.abort(this._requests.tags);

      this._requests.tags = null;
      delete this._requests.tags;
    }

    this._requests.tags = Request.fetch(
      '/api/pages/getTags/', {
      success: tags => {
        this._requests.tags = null;
        delete this._requests.tags;

        this.setState({tags});
      },

      error: error => {
        this._requests.tags = null;
        delete this._requests.tags;

        Popups.createPopup({
          content: Lang.get('page-editor.error_' + error)
        });
      },

      data: {
        type:    this.state.type,
        visible: "all",
      }
    });
  },

  /**
   *  Load page
   */
  _loadPage() {
    this.setState({page: false});

    this._requests.page = Request.fetch(
      '/api/pages/getPage/', {
      success: page => {
        this._requests.page = null;
        delete this._requests.page;

        this.setState({page});
      },

      error: error => {
        this._requests.page = null;
        delete this._requests.page;

        Popups.createPopup({
          content: Lang.get('page-editor.error_' + error)
        });
      },

      data: {
        type: this.state.type,
        id:   this.state.id,
      }
    });
  },

  /**
   *  Update page preview
   */
  _updatePreview(photo_id) {
    if (this.state.loading) {
      return;
    }

    this.setState({loading: true});

    this._requests.update = Request.fetch(
      '/api/pages/updatePhoto/', {
      success: preview => {
        this._requests.update = null;
        delete this._requests.update;

        var page = this.state.page;
        page.preview = preview;

        this.setState({page});

        this.setState({loading: false});
      },

      error: error => {
        this._requests.update = null;
        delete this._requests.update;

        this.setState({loading: false});

        Popups.createPopup({
          content: Lang.get('page-editor.error_' + error)
        });
      },

      data: {
        type:     this.state.type,
        id:       this.state.id,
        photo_id: photo_id,
      }
    });
  },

  /**
   *  Update page data
   */
  _updateDate(date) {
    if (this.state.loading) {
      return;
    }

    this.setState({loading: true});

    this._requests.update = Request.fetch(
      '/api/pages/updateDate/', {
      success: response => {
        this._requests.update = null;
        delete this._requests.update;

        var page       = this.state.page;
        page.date      = response.date;
        page.timestamp = response.timestamp;

        this.setState({page});

        this.setState({loading: false});
      },

      error: error => {
        this._requests.update = null;
        delete this._requests.update;

        this.setState({loading: false});

        Popups.createPopup({
          content: Lang.get('page-editor.error_' + error)
        });
      },

      data: {
        type: this.state.type,
        id:   this.state.id,
        date
      }
    });
  },

  /**
   *  Update page tags
   */
  _updateTag(group, tags) {
    if (this.state.loading) {
      return;
    }

    this.setState({loading: true});

    this._requests.update = Request.fetch(
      '/api/pages/updateTags/', {
      success: response => {
        this._requests.update = null;
        delete this._requests.update;

        var page = this.state.page;
        page.tags = response.page_tags;

        this.setState({
          tags:    response.tags,
          loading: false,
          page,
        });
      },

      error: error => {
        this._requests.update = null;
        delete this._requests.update;

        this.setState({loading: false});

        Popups.createPopup({
          content: Lang.get('page-editor.error_' + error)
        });
      },

      data: {
        type: this.state.type,
        id:   this.state.id,
        tags
      }
    });
  },

  /**
   *  Update page info
   */
  _updatePageInfo() {
    var key = "update_info";

    if (this._requests[key]) {
      Request.abort(this._requests[key]);

      this._requests[key] = null;
      delete this._requests[key];
    }

    this._requests.update = Request.fetch(
      '/api/pages/updateVersions/', {
      success: () => {
        this._requests[key] = null;
        delete this._requests[key];
      },

      error: error => {
        this._requests[key] = null;
        delete this._requests[key];
      },

      data: {
        id: this.state.id,
      }
    });
  },

  _makeTagsSelector() {
    return (
      <Tags
        tag="page"
        name={Lang.get('page-editor.page_tags')}
        value={this.state.page.tags}
        values={Object.keys(this.state.tags)}
        multiple={true}
        onSelect={this._updateTag}
      />
    );
  },

  render() {
    if (!this.state.page) {
      return (
        <Wrapper>
          <div className="loader" />
        </Wrapper>
      );
    }

    var tags_selector = null;
    var tags_loader   = null;

    if (this.state.tags === false) {
      tags_loader = <div className="loader" />;
    }

    if (this.state.tags !== false) {
      tags_selector = this._makeTagsSelector();
    }

    return (
      <Wrapper>
        <div className="page-editor">

          <div className="page-editor__tags-wrapper">
            <div className="page-editor__tags">
              {tags_loader}
              {tags_selector}
            </div>
          </div>

          <div className="page-editor__common-wrapper">
            <div className="page-editor__common">
              <Preview
                page={this.state.page}
                loading={this.state.loading}
                onSelect={this._updatePreview}
                onClear={this._updatePreview}
              />

              <form onSubmit={e => {
                  e.preventDefault();
                  this._updateDate(this.refs.date.value);
                }}>

                <input
                  disabled={this.state.loading}
                  ref="date"
                  type="text"
                  defaultValue={this.state.page.date}
                  placeholder={Lang.get('page-editor.page_date')}
                />

              </form>
            </div>
          </div>
          <div className="floating-clear" />

          <div className="page-editor__editor">
            <Editor
              onUpdate={this._updatePageInfo}
              entry_key={"page_" + this.state.page.id}
              langs={[
                Lang.getLang(),
                Lang.getLang() == "en" ? "ru" : "en"
              ]}
            />
          </div>
        </div>
      </Wrapper>
    );
  },
});

module.exports = PageEditor;