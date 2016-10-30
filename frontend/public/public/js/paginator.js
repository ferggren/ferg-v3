/**
 * @file Provide paginator support
 * @name Paginator
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

/**
 *  Creates a paginator
 * 
 *  @param {object} data List of paginator options
 *                       page - Current page
 *                       pages - Total pages
 *                       size_dynamic - Size of dunamic (middle) part of paginator
 *                       size_static - Size of static (first & last pages) part of paginator
 */
var Paginator = function(data) {
    if (typeof data != 'object') {
        data = {};
    }

    this.page = parseInt(data.page);
    this.pages = parseInt(data.pages);
    this.size_dynamic = parseInt(data.size_dynamic);
    this.size_static = parseInt(data.size_static);

    if (isNaN(this.page)) this.page = 1;
    if (isNaN(this.pages)) this.pages = 1;
    if (isNaN(this.size_dynamic)) this.size_dynamic = 2;
    if (isNaN(this.size_static)) this.size_static = 1;

    this.onselect = false;

    if (typeof data.onselect == 'function') {
        this.onselect = data.onselect;
    }

    this.init();
}

Paginator.prototype = {
    init: function() {
        this.elements = {};

        var wrapper = document.createElement('div');
        wrapper.className = 'paginator__wrapper';

        var prev = document.createElement('div');
        prev.className = 'paginator__prev';

        var next = document.createElement('div');
        next.className = 'paginator__next';

        var pages = document.createElement('div');
        pages.className = 'paginator__pages';

        wrapper.appendChild(prev);
        wrapper.appendChild(pages);
        wrapper.appendChild(next);

        this.elements.wrapper = wrapper;
        this.elements.prev = prev;
        this.elements.pages = pages;
        this.elements.next = next;

        this.__makePrev();
        this.__makePages();
        this.__makeNext();
    },

    /**
     * Destroys paginator object
     */
    destroy: function() {
        if (typeof this.elements != 'object') {
            return;
        }

        for (var id in this.elements) {
            if (typeof this.elements[id] != 'object') {
                this.elements[id] = null;
                continue;
            }

            if (this.elements[id].parentNode && this.elements[id].parentNode.removeChild) {
                this.elements[id].parentNode.removeChild(
                    this.elements[id]
                );
            }

            this.elements[id].__parent = null;
            this.elements[id].onclick = null;
            this.elements[id] = null;
        }

        this.elements = null;
    },

    /**
     *  Returns paginator node
     */
    getNode: function() {
        return this.elements.wrapper;
    },

    /**
     *  Makes previos page button
     */
    __makePrev: function() {
        this.elements.prev.innerHTML = '';

        this.elements.prev.appendChild(
            this.__makeButton({
                title: '←',
                page: this.page - 1,
                active: (this.page > 1),
            })
        );
    },

    /**
     *  Makes page selector
     */
    __makePages: function() {
        this.elements.pages.innerHTML = '';

        // if total size of pages is less than static
        if (this.pages <= ((this.size_static * 2) + 1)) {
            // than we can go in a simple way
            this.__addPagesRange(1, this.pages);
            return;
        }

        // left static pages
        this.__addPagesRange(1, this.size_static);

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
            this.elements.pages.appendChild(
                this.__makeButton({
                    title: '...',
                    active: false,
                })
            );
        }

        // dynamic middle pages
        this.__addPagesRange( dynamic_left, dynamic_right);

        // if needed - separator
        if ((this.pages - this.size_static) > dynamic_right) {
            this.elements.pages.appendChild(
                this.__makeButton({
                    title: '...',
                    active: false,
                })
            );
        }

        // right static pages
        this.__addPagesRange(
            this.pages - this.size_static + 1,
            this.pages
        );
    },

    /**
     *  Makes next page button
     */
    __makeNext: function() {
        this.elements.next.innerHTML = '';

        this.elements.next.appendChild(
            this.__makeButton({
                title: '→',
                page: this.page + 1,
                active: (this.page < this.pages),
            })
        );
    },

    /**
     *  Adds a pages range into pages container
     *
     *  @param {number} page Start page
     *  @param {number} pages End page
     */
    __addPagesRange: function(page, pages) {
        for (var i = page; i <= pages; ++i) {
            this.elements.pages.appendChild(
                this.__makeButton({
                    title: i,
                    page: i,
                    active: (i != this.page),
                })
            );
        }
    },

    /**
     *  Internal buttons counter
     */
    __next_button_id: 0,

    /**
     *  Creates and returns button node
     *
     *  @param {object} data List of button options
     *                       active - if button active or not
     *                       page - button page
     *                       title - button title
     */
    __makeButton: function(data) {
        var button = document.createElement('div');

        button.className = 'paginator__button';
        if (!data.active) {
            button.className += ' paginator__button--inactive';
        }

        button.innerHTML = data.title;

        if (data.page) {
            button.setAttribute('page', data.page);
        }

        if (data.page && data.active) {
            button.__parent = this;
            button.onclick = this.__pageOnClick;
        }

        this.elements['button_' + this.__next_button_id++] = button;

        return button;
    },

    /**
     *  Button on click event listner
     */
    __pageOnClick: function(e) {
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        if (!this.__parent) {
            return false;
        }

        if (!this.__parent.onselect) {
            return false;
        }

        var page = parseInt(this.getAttribute('page'));

        if (isNaN(page)) {
            return false;
        }

        this.__parent.onselect(page);

        return false;
    },
}