/**
 * @file Storage api
 * @name Storage
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

/**
 *  Creates Storage instance
 *  @constructor
 *  @this {Storage}
 *
 *  @param {object} storage Storage options
 *                          container - Storage container
 *                          onselect - Called when file is selected
 *                          onupload - Called when file us uploaded
 *                          upload_access - Access level for uploaded files (public / private)
 *                          photo_protection - Enables protection for photos (restrict max size & adds watermark)
 *                          admin_mode - Enables admin mode
 *                          group_upload - Upload file to specific group
 *                          group_display - Show specific group (not working with admin_mode)
 *                          media - display and upload only selected media types
 *                                  photo, video, audio, document, source, archive, other
 *                                  default = all
 */
function Storage(storage) {
    if (typeof storage != 'object') {
        return false;
    }

    if (typeof storage.container == 'undefined') {
        return false;
    }

    if (typeof storage.container == 'string') {
        var container = document.getElementById(storage.container);

        if (!container) {
            return false;
        }

        storage.container = container;
    }

    if (typeof storage.onselect != 'function') {
        storage.onselect = function() {};
    }

    if (typeof storage.onupload != 'function') {
        storage.onupload = function() {};
    }

    if (typeof storage.media != 'object') {
        storage.media = this.media_types;
    }

    if (typeof storage.upload_access == 'undefined' || storage.upload_access != 'private') {
        storage.upload_access = 'public';
    }

    if (typeof storage.photo_protection == 'undefined') {
        storage.photo_protection = false;
    }

    storage.photo_protection = !!storage.photo_protection;

    if (typeof storage.admin_mode == 'undefined') {
        storage.admin_mode = false;
    }
    
    storage.admin_mode = !!storage.admin_mode;

    if (typeof storage.group_upload != 'string') {
        storage.group_upload = false;
    }

    if (typeof storage.group_display != 'string') {
        storage.group_display = false;
    }

    this.container = storage.container;
    this.onselect = storage.onselect;
    this.onupload = storage.onupload;
    this.upload_access = storage.upload_access;
    this.photo_protection = storage.photo_protection;
    this.admin_mode = storage.admin_mode;
    this.group_upload = storage.group_upload;
    this.group_display = storage.group_display;
    this.media = storage.media;

    this.init();
}

Storage.prototype = {
    /** Supported media types */
    media_types: [
        'photo', 'video', 'audio', 'document', 'source', 'archive', 'other'
    ],

    /**
     *  Initialize storage
     */
    init: function() {
        var that = this;
        this.container.innerHTML = '<div class="nice-form__loader"></div>';

        Rocky.ajax({
            url: '/ajax/storage/getStats',

            success: function(stats) {
                that.stats = stats;
                that.makeStorageWrapper();
                that.showFilters();
                that.loadFiles();
            },

            error: function(error) {
                that.container.innerHTML = '<div class="nice-form__error">' + error + '</div>';
            },

            data: {
                admin_mode: this.admin_mode,
                media: this.media.join(','),
            },
        });
    },

    /**
     *  Make DOM containers
     */
    makeStorageWrapper: function() {
        this.container.innerHTML = '';

        var storage_wrapper = document.createElement('div');
        storage_wrapper.className = 'storage__wrapper';

        var filters_wrapper = document.createElement('div');
        filters_wrapper.className = 'storage__filters-wrapper';

        var filters = document.createElement('div');
        filters.className = 'storage__filters';

        var files_wrapper = document.createElement('div');
        files_wrapper.className = 'storage__files-wrapper';

        var files = document.createElement('div');
        files.className = 'storage__files';

        var clear = document.createElement('div');
        clear.className = 'floating-clear';

        storage_wrapper.appendChild(filters_wrapper);
        storage_wrapper.appendChild(files_wrapper);
        storage_wrapper.appendChild(clear);

        filters_wrapper.appendChild(filters);
        files_wrapper.appendChild(files);

        this.container.appendChild(storage_wrapper);

        this.files_wrapper = files;
        this.filters_wrapper = filters;
    },

    /**
     *  Show all filters
     */
    showFilters: function() {
        console.log('filters');
        this.filters_wrapper.innerHTML = 'filters';
    },

    /**
     *  Load files with current filters
     */
    loadFiles: function() {
        console.log('load files');
        this.files_wrapper.innerHTML = 'files';
    },
}