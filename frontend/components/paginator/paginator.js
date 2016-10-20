var React = require('react');

require('./paginator.scss');

var Paginator = React.createClass({
  page:  false,
  pages: false,

  size_dynamic: 0,
  size_static:  0,

  shouldComponentUpdate(next_props) {
    if (this.props.page != next_props.page) {
      return true;
    }

    if (this.props.pages != next_props.pages) {
      return true;
    }

    return false;
  },

  _makePaginatorPrev() {
    return this._makeButton({
      title: '←',
      page: this.page - 1,
      active: (this.page > 1),
    });
  },

  _makePaginatorNext() {
    return this._makeButton({
      title: '→',
      page: this.page + 1,
      active: (this.page < this.pages),
    })
  },

  _makePaginatorPages() {
    // if total size of pages is less than static
    if (this.pages <= ((this.size_static * 2) + 1)) {
      // than we can go in a simple way
      return this._makePagesRange(1, this.pages);
    }

    var list = [];

    // left static pages
    list = list.concat(this._makePagesRange(
      1,
      this.size_static
    ));

    var dynamic_left = Math.max(
      this.page - this.size_dynamic,
      this.size_static + 1
    );

    var dynamic_right = Math.min(
      this.page + this.size_dynamic,
      this.pages - this.size_static
    );

    // if needed - separator
    if ((this.size_static + 1) < dynamic_left) {
      list = list.concat([
        this._makeButton({
          title: '...',
          active: false,
          page: 'buttons_left',
        })
      ]);
    }

    // dynamic middle pages
    list = list.concat(this._makePagesRange(
      dynamic_left,
      dynamic_right
    ));

    // if needed - separator
    if ((this.pages - this.size_static) > dynamic_right) {
      list = list.concat([
        this._makeButton({
          title: '...',
          active: false,
          page: 'buttons_right',
        })
      ]);
    }

    // right static pages
    list = list.concat(this._makePagesRange(
      this.pages - this.size_static + 1,
      this.pages
    ));

    return list;
  },

  _makePagesRange: function(page_from, page_to) {
    var range = [];

    for (var i = page_from; i <= page_to; ++i) {
      range.push(this._makeButton({
        title: i,
        page: i,
        active: (i != this.page),
      }));
    }

    return range;
  },

  _makeButton(button) {
    var props = {
      key:       'page_' + button.page,
      className: 'paginator__button',
    }

    if (!button.active) {
      props.className += ' paginator__button--inactive';
    }

    if (this.props.url && button.active) {
      props.href = this.props.url.replace('%page%', button.page);
    }

    if (button.active && typeof this.props.onSelect == 'function') {
      props.onClick = (e) => {
        e.preventDefault()
        this.props.onSelect(button.page);
      };
    }

    return (
      <a {...props}>
        {button.title}
      </a>
    );
  },

  render() {
    this.page = parseInt(this.props.page);
    this.pages = parseInt(this.props.pages);
    this.size_dynamic = parseInt(this.props.size_dynamic);
    this.size_static = parseInt(this.props.size_static);

    if (isNaN(this.page)) this.page = 1;
    if (isNaN(this.pages)) this.pages = 1;
    if (isNaN(this.size_dynamic)) this.size_dynamic = 2;
    if (isNaN(this.size_static)) this.size_static = 1;

    var paginator_prev  = this._makePaginatorPrev();
    var paginator_next  = this._makePaginatorNext();
    var paginator_pages = this._makePaginatorPages();

    return (
      <div className="paginator__wrapper">
        <div className="paginator__prev">
          {paginator_prev}
        </div>

        <div className="paginator__pages">
          {paginator_pages}
        </div>

        <div className="paginator__next">
          {paginator_next}
        </div>
      </div>
    );
  }
});

module.exports = Paginator;