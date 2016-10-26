/**
 * @file Pages List
 * @name PagesList
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

var React     = require('react');
var Lang      = require('libs/lang');
var Request   = require('libs/request');
var Popups    = require('libs/popups-nice');
var TagsCloud = require('components/tags-cloud');
var Paginator = require('components/paginator');
var Wrapper   = require('components/view/content-wrapper');

require('./pages-list.scss');
require('styles/partials/floating_clear');
require('styles/partials/loader');

Lang.exportStrings(
  'pages-list',
  require('./pages-list.lang-' + Lang.getLang() + '.js')
);

var PagesList = React.createClass({
  _requests: {},

  componentWillReceiveProps(nextProps) {
    this.setState(this.getInitialState(nextProps));
    this.componentDidMount();
  },

  getInitialState(props) {
    props = props || this.props;

    return {
      type:     props.params.page_type,
      page:     1,
      pages:    1,
      list:     [],
      tags:     false,
      tag:      "",
      loading:  false,
      creating: false,
    }  
  },

  /**
   *  Load pages
   */
  componentDidMount() {
    this._loadTags();
    this._loadPages();
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
        this.setState({tags});

        this._requests.tags = null;
        delete this._requests.tags;
      },

      error: error => {
        Popups.createPopup({
          content: Lang.get('pages-list.error_' + error)
        });

        this._requests.tags = null;
        delete this._requests.tags;
      },

      data: {
        type:    this.state.type,
        visible: "all",
      }
    });
  },

  /**
   *  Select tag
   */
  _selectTag(group, tag) {
    this.setState({
      page:  1,
      pages: 1,
      tag:   tag,
    }, this._loadPages);
  },

  /**
   *  Select page
   */
  _selectPage(page) {
    this.setState({page}, this._loadPages);
  },

  _createPage() {
    this.setState({creating: true});

    this._requests.tags = Request.fetch(
      '/api/pages/createPage/', {
      success: page => {
        this.setState({creating: false});

        this._editPage(page);

        this._requests.tags = null;
        delete this._requests.tags;
      },

      error: error => {
        Popups.createPopup({
          content: Lang.get('pages-list.error_' + error)
        });

        this.setState({creating: false});

        this._requests.tags = null;
        delete this._requests.tags;
      },

      data: {
        type: this.state.type,
      }
    });
  },

  /**
   *  Load pages
   */
  _loadPages() {
    if (this._requests.pages) {
      Request.abort(this._requests.pages);

      this._requests.pages = null;
      delete this._requests.pages;
    }

    this._requests.pages = Request.fetch(
      '/api/pages/getPages/', {
      success: response => {

        this.setState({
          page:    response.page,
          pages:   response.pages,
          list:    response.list,
          loading: false,
        });

        this._requests.pages = null;
        delete this._requests.pages;
      },

      error: error => {
        Popups.createPopup({
          content: Lang.get('pages-list.error_' + error)
        });

        this.setState({loading: false});

        this._requests.pages = null;
        delete this._requests.pages;
      },

      data: {
        type:    this.state.type,
        visible: "all",
        page:    this.state.page,
        tag:     this.state.tag,
      }
    });

    this.setState({loading: true});
  },

  /**
   *  Edit page
   */
  _editPage(page) {
    console.log('edit', page);
  },

  /**
   * Make tags loader
   */
  _makeTagsLoader() {
    return (
      <div className="loader" />
    );
  },

  /**
   *  Make tags cloud
   */
  _makeTagsCloud() {
    return (
      <TagsCloud
        group={"pages_" + this.state.type + "_all"}
        tags={this.state.tags}
        selected={this.state.tag}
        onSelect={this._selectTag}
      />
    );
  },

  /**
   *  Make paginator
   */
  _makePaginator() {
    return (
      <Paginator
        page={this.state.page}
        pages={this.state.pages}
        onSelect={this._selectPage}
      />
    );
  },

  /**
   * Make pages laoder
   */
  _makePagesLoader() {
    return (
      <div className="loader" />
    );
  },

  /**
   * Make pages not found
   */
  _makePagesNotFound() {
    return (
      <div className="pages-list__not-found">
        {Lang.get('pages-list.pages_not_found')}
      </div>
    );
  },

  /**
   *  Make create loader
   */
  _makeCreateButton() {
    return (
      <div className="pages-list__create" onClick={this._createPage}>
        {Lang.get('pages-list.create_new_page')}
      </div>
    );
  },

  /**
   *  Make create loader
   */
  _makeCreateLoader() {
    return (
      <div className="pages-list__create-loader">
        <div className="loader" />
      </div>
    );
  },

  render() {
    var pages_loader    = null;
    var pages_list      = null;
    var pages_not_found = null;
    var button_loader   = null;
    var button          = null;
    var paginator       = null;
    var tags_loading    = null;
    var tags_cloud      = null;

    // create button
    if (!this.state.creating) {
      button = this._makeCreateButton();
    }

    // create loader
    if (this.state.creating) {
      button_loader = this._makeCreateLoader();
    }

    // tags cloud
    if (this.state.tags !== false) {
      tags_cloud = this._makeTagsCloud();
    }

    // tags loading
    if (this.state.tags === false) {
      tags_cloud = this._makeTagsLoader();
    }

    // pages list
    if (this.state.list.length) {

    }

    // pages not found
    if (this.state.loading == false && !this.state.list.length) {
      pages_not_found = this._makePagesNotFound();
    }

    // pages loader
    if (this.state.loading) {
      pages_loader = this._makePagesLoader();
    }

    // paginator
    if (!this.state.loading) {
      paginator = this._makePaginator();
    }

    return (
      <Wrapper>
        <div className="pages-list">
          {button}
          {button_loader}

          <div className="pages-list__tags-wrapper">
            <div className="pages-list__tags">
              {tags_loading}
              {tags_cloud}
            </div>
          </div>

          <div className="pages-list__pages-wrapper">
            <div className="pages-list__pages">
              {pages_list}
              {pages_not_found}
              {pages_loader}
              {paginator}
            </div>
          </div>

          <div className="floating-clear" />
        </div>
      </Wrapper>
    );
  },
});

module.exports = PagesList;