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

    if (typeof storage.multiple == 'undefined') {
        storage.multiple = true;
    }
    storage.multiple = !!storage.multiple;

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
    this.media_stats = {};
    this.groups = {};
    this.multiple = storage.multiple;

    this.files_page = 1;
    this.files_pages = 1;
    this.files_total = 0;

    this.filter_orderby = 'newest';
    this.filter_media = 'all';

    if (this.media.length == 1) {
        this.filter_media = this.media[1];
    }

    this.filter_group = this.group_display ? this.group_display : 'all';

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

            success: function(response) {
                that.media_stats = response.media;
                that.groups = response.groups;
                that.makeStorageWrappers();
                that.showFilters();
                that.loadFiles();
                that.watchUpload();

                that = null;
            },

            error: function(error) {
                that.container.innerHTML = '<div class="nice-form__error">' + error + '</div>';

                that = null;
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
    makeStorageWrappers: function() {
        this.container.innerHTML = '';

        var storage_wrapper = document.createElement('div');
        storage_wrapper.className = 'storage__wrapper';

        var upload = document.createElement('div');
        upload.className = 'storage__upload';
        upload.innerHTML = Lang.get('storage.file_upload');

        var uploads = document.createElement('div');
        uploads.className = 'storage__uploads';

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

        storage_wrapper.appendChild(upload);
        storage_wrapper.appendChild(uploads);
        storage_wrapper.appendChild(filters_wrapper);
        storage_wrapper.appendChild(files_wrapper);
        storage_wrapper.appendChild(clear);

        filters_wrapper.appendChild(filters);
        files_wrapper.appendChild(files);

        this.container.appendChild(storage_wrapper);

        this.files_wrapper = files;
        this.filters_wrapper = filters;
        this.upload_wrapper = upload;
        this.uploads_wrapper = uploads;
    },

    /**
     *  Show all filters
     */
    showFilters: function() {
        this.filters_wrapper.innerHTML = '';

        if (this.showFilters_order()) {
            this.addFiltersSpacing();
        }

        if (this.showFilters_media()) {
            this.addFiltersSpacing();
        }

        if (this.showFilters_groups()) {
            this.addFiltersSpacing();
        }
    },

    /**
     *  Show order filters
     *
     *  @return {number} Amount of shown filters
     */
    showFilters_order: function() {
        var wrapper = document.createElement('div');
        wrapper.className = 'storage__filters-group storage__filters-group--orderby';

        var filters = ['newest', 'popular'];

        for (var filter in filters) {
            filter = filters[filter];

            this.addFilterButton({
                wrapper: wrapper,
                filter_type: 'orderby',
                filter_value: filter,
                title: Lang.get('storage.orderby_' + filter),
                selected: this.filter_orderby == filter,
            });
        }

        this.filters_wrapper.appendChild(wrapper);

        return 2;
    },

    /**
     *  Show media filters
     *
     *  @return {number} Amount of shown filters
     */
    showFilters_media: function() {
        var wrapper = document.createElement('div');
        wrapper.className = 'storage__filters-group storage__filters-group--media';

        if (this.media.length > 1) {
            var total = 0;
            for (var media in this.media_stats) {
                total += this.media_stats[media];
            }

            this.addFilterButton({
                wrapper: wrapper,
                filter_type: 'media',
                filter_value: 'all',
                amount: total,
                title: Lang.get('storage.media_all'),
                selected: this.filter_media == 'all',
            });
        }

        for (var media in this.media_stats) {
            this.addFilterButton({
                wrapper: wrapper,
                filter_type: 'media',
                filter_value: media,
                amount: this.media_stats[media],
                title: Lang.get('storage.media_' + media),
                selected: this.filter_media == media,
            });
        }

        this.filters_wrapper.appendChild(wrapper);

        return 1 + Object.keys(this.media_stats).length;
    },

    /**
     *  Show user groups filters
     *
     *  @return {number} Amount of shown filters
     */
    showFilters_groups: function() {
        if (!Object.keys(this.groups).length) {
            return 0;
        }
    },

    /**
     *  Add spacing to filters
     */
    addFiltersSpacing: function() {
        var spacing = document.createElement('div');
        spacing.className = 'storage__filters-spacing';
        this.filters_wrapper.appendChild(spacing);
    },

    /**
     *  Add filter button
     *
     *  @param {object} info Button info
     *                       wrapper - Parent wrapper
     *                       filter_type - Type of a filter
     *                       filter_value - Value of a filter
     *                       amount - Amount of files belongs to filter
     *                       title - Title of a filter
     *                       selected - Is filter current
     */
    addFilterButton: function(info) {
        var that = this;

        var button = document.createElement('a');
        button.className = 'storage__filter';
        button.setAttribute('filter_type', info.filter_type);
        button.setAttribute('filter_value', info.filter_value);

        if (info.filter_type == 'media') {
            var img = document.createElement('img');
            img.src = '/images/site/storage/media_' + info.filter_value + '.png';

            button.appendChild(img);
        }

        button.appendChild(document.createTextNode(info.title));

        if (info.selected) {
            button.className += ' storage__filter--selected';
        }

        button.onclick = function() {
            that.setFilter(
                this.getAttribute('filter_type'),
                this.getAttribute('filter_value')
            );
        };

        info.wrapper.appendChild(button);
    },

    /**
     *  Change current filter
     *
     *  @param {string} filter Filters type
     *  @param {string} value Filters value
     */
    setFilter: function(filter, value) {
        filter = 'filter_' + filter;

        if (typeof this[filter] == 'undefined') {
            return;
        }

        this.files_page = 1;
        this.files_pages = 1;

        this[filter] = value;
        this.showFilters();
        this.loadFiles();
    },

    /**
     *  Load files with current filters
     */
    loadFiles: function() {
        var that = this;
        this.files_wrapper.innerHTML = '<div class="nice-form__loader"></div>';

        Rocky.ajax({
            url: '/ajax/storage/getFiles',

            success: function(response) {
                that.files_page = response.page;
                that.files_pages = response.pages;
                that.files_total = response.total;
                that.files = response.files;

                that.showFiles();
                that = null;
            },

            error: function(error) {
                that.files_wrapper.innerHTML = '<div class="nice-form__error">' + error + '</div>';
                that = null;
            },

            data: {
                admin_mode: this.admin_mode,
                media: this.filter_media,
                group: this.filter_group,
                orderby: this.filter_orderby,
                page: this.page,
                pages: this.pages,
            },
        });
    },

    /**
     *  Show loaded user files
     */
    showFiles: function() {
        this.files_wrapper.innerHTML = '';

        if (!this.files.length) {
            var error = document.createElement('div');
            error.className = 'nice-form__success';
            error.innerHTML = Lang.get('storage.error_files_not_found');

            this.files_wrapper.appendChild(error);
            return;
        }
    },

    watchUpload: function() {
        var that = this;

        this.upload_wrapper.addEventListener(
            'drop',
            function(e) {
                if (e.stopPropagation) e.stopPropagation();
                if (e.preventDefault) e.preventDefault();

                this.className = 'storage__upload';

                if (!e.dataTransfer || !e.dataTransfer.files) {
                    return false;
                }

                var files = e.dataTransfer.files;

                for (var i = 0; i < files.length; i++) {
                    var form = new FormData();
                    form.append('upload', files[i]);
                    that.uploadFile(form);
                }
            },
            false
        );

        this.upload_wrapper.addEventListener(
            'dragenter',
            function(e) {
                if (e.stopPropagation) e.stopPropagation();
                if (e.preventDefault) e.preventDefault();

                this.className = 'storage__upload storage__upload--hover';
            },
            false
        );

        this.upload_wrapper.addEventListener(
            'dragover',
            function(e) {
                if (e.stopPropagation) e.stopPropagation();
                if (e.preventDefault) e.preventDefault();
            },
            false
        );

        this.upload_wrapper.addEventListener(
            'dragleave',
            function(e) {
                if (e.stopPropagation) e.stopPropagation();
                if (e.preventDefault) e.preventDefault();

                this.className = 'storage__upload';
            },
            false
        );

        this.upload_wrapper.onclick = function() {
            that.showUploadForm();
        }
    },

    showUploadForm: function() {
        var that = this;

        var form = document.createElement('form');
        var input = document.createElement('input');
        input.name = 'upload';
        input.multiple = false;
        input.type = 'file';

        if (this.filter_media == 'photo') {
            input.accept = 'image/*';
        }

        if (this.filter_media == 'audio') {
            input.accept = 'audio/*';
        }

        if (this.filter_media == 'video') {
            input.accept = 'video/*';
        }

        form.appendChild(input);
        input.click();

        input.onchange = function() {
            var form_data = new FormData(form);
            that.uploadFile(form_data);

            form_data = null;
        }
    },

    uploadFile: function(form_data) {
        var that = this;

        form_data.append('media', this.filter_media);

        var upload_name = Lang.get('storage.file_uploading');

        if (form_data.get) {
            var file = form_data.get('upload');

            if (file && file.name) {
                upload_name = file.name;
            }
        }

        var uploader = document.createElement('div');
        uploader.className = 'storage__uploads-file';

        var progress = document.createElement('div');
        progress.className = 'storage__uploads-progress';
        progress.style.width = '0%';

        var title = document.createElement('div');
        title.className = 'storage__uploads-title';
        title.innerHTML = upload_name;

        uploader.appendChild(progress);
        uploader.appendChild(title);

        this.uploads_wrapper.appendChild(uploader);

        Rocky.ajax({
            url: '/ajax/storage/upload',
            data: form_data,

            success: function(file) {
                that.uploads_wrapper.removeChild(uploader);
                Popup.createWindow({
                    content: file
                });
            },

            error: function(error) {
                that.uploads_wrapper.removeChild(uploader);
                Popup.createWindow({
                    content: error
                });
            },

            progress: function(loaded, total) {
                var percents = Math.floor((loaded / total) * 100);
                progress.style.width = percents + '%';
                title.innerHTML = upload_name + '(' + percents + '%)';
            },
        });
    },
}