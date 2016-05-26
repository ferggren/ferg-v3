var Storage = function(options) {
    this.__init(options);
};

Storage.prototype = {
    media_valid: [
        'photo',
        'video',
        'audio',
        'document',
        'source',
        'archive',
        'other'
    ],

    destroy: function() {
        var keys = ['uploader', 'files', 'display'];

        for (var key in keys) {
            key = keys[key];

            if (!this[key]) {
                continue;
            }

            this[key].destroy();
            this[key] = null;
        }

        for (var container in this.containers) {
            this.containers[container] = null;
        }

        this.containers = null;
        this.options = null;
    },

    __init: function(options) {
        if (!(options = this.__validate(options))) {
            throw new Error('invalid options');
        }

        this.options = options;
        this.__makeContainers();

        try {
            this.uploader = new StorageUploader(
                this.containers.uploader,
                this,
                this.options.uploader
            );

            this.display = new StorageDisplayOptions(
                this.containers.display,
                this,
                this.options.display
            );

            this.files = new StorageFiles(
                this.containers.files,
                this,
                this.options.files
            );
        }
        catch (e) {
            this.destroy();
            throw e;
        }

        var that = this;

        this.files.onselect(function(file) {
            that.__onFileSelect(file);
        });

        this.uploader.onupload(function(file) {
            that.__onFileUpload(file);
        });
    },

    __validate: function(options) {
        if (typeof options != 'object') {
            return false;
        }

        if (typeof options.container == 'undefined') {
            return false;
        }

        if (typeof options.container == 'string') {
            var container = document.getElementById(options.container);

            if (!container) {
                return false;
            }

            options.container = container;
        }

        if (typeof options.container != 'object') {
            return false;
        }

        if (typeof options.onselect != 'function') {
            options.onselect = false;
        }

        if (typeof options.onupload != 'function') {
            options.onupload = false;
        }

        if (typeof options.admin_mode == 'undefined') {
            options.admin_mode = false;
        }
        options.admin_mode = !!options.admin_mode;

        if (!(options = this.__validateDisplay(options))) {
            return false;
        }

        if (!(options = this.__validateUpload(options))) {
            return false;
        }

        if (!(options = this.__validateFiles(options))) {
            return false;
        }

        return options;
    },

    __validateUpload: function(options) {
        var upload = (typeof options.upload == 'object') ? options.upload : {};

        if (typeof upload.photo_protection == 'undefined') {
            upload.photo_protection = false;
        }
        upload.photo_protection = !!upload.photo_protection;

        if (typeof upload.access == 'undefined') {
            upload.access = 'public';
        }
        upload.access = upload.access == 'public' ? 'public' : 'protected';

        if (typeof upload.media != 'object') {
            upload.media = this.media_valid;
        }
        else {
            upload.media = this.__validateMedia(upload.media);
        }

        if (typeof upload.group != 'string' || options.admin_mode) {
            upload.group = false;
        }

        options.upload = upload;

        return options;
    },

    __validateDisplay: function(options) {
        var display = (typeof options.display == 'object') ? options.display : {};

        if (typeof display.media != 'object') {
            display.media = this.media_valid;
        }
        else {
            display.media = this.__validateMedia(display.media);
        }

        if (typeof display.group != 'string' || options.admin_mode) {
            display.group = false;
        }

        if (typeof display.show_groups == 'undefined' || options.admin_mode) {
            display.show_groups = false;
        }
        display.show_groups = !!display.show_groups;

        display.admin_mode = options.admin_mode;

        options.display = display;

        return options;
    },

    __validateFiles: function(options) {
        var files = {};

        files.admin_mode = options.admin_mode;
        options.files = files;

        return options;
    },

    __validateMedia: function(user_media) {
        var valid = [];

        for (var i in user_media) {
            var media = user_media[i];
            var found = false;

            for (var j in this.media_valid) {
                var valid_media = this.media_valid[j];

                if (media != valid_media) {
                    continue;
                }

                found = true;
                break;
            }

            if (!found) {
                continue;
            }

            valid.push(media);
        }

        if (!valid.length) {
            valid = this.media_valid;
        }

        return valid;
    },

    __onFileSelect: function(file) {
        console.log("onFileSelect", file);
    },

    __onFileUpload: function(file) {
        console.log("onUpload", file);
    },

    __makeContainers: function() {
        this.containers = {};

        var wrappers = {};
        var elements = [
            ['storage_wrapper', 'storage__wrapper'],
            ['uploader',        'storage__uploader'],
            ['display_wrapper', 'storage__options-wrapper'],
            ['display',         'storage__options'],
            ['files_wrapper',   'storage__files-wrapper'],
            ['files',           'storage__files'],
            ['clear',           'floating-clear'],
        ];

        for (var element in elements) {
            element = elements[element];

            wrappers[element[0]] = document.createElement('div');
            wrappers[element[0]].className = element[1];
        }

        wrappers.storage_wrapper.appendChild(wrappers.uploader);
        wrappers.storage_wrapper.appendChild(wrappers.display_wrapper);
        wrappers.storage_wrapper.appendChild(wrappers.files_wrapper);
        wrappers.storage_wrapper.appendChild(wrappers.clear);

        wrappers.files_wrapper.appendChild(wrappers.files);
        wrappers.display_wrapper.appendChild(wrappers.display);

        this.options.container.innerHTML = '';
        this.options.container.appendChild(wrappers.storage_wrapper);

        this.containers = {
            uploader: wrappers.uploader,
            files: wrappers.files,
            display: wrappers.display,
        };

        wrappers = null;

        return true;
    },
};

var StorageUploader = function(container, storage, options) {
    this.container = container;
    this.storage = storage;
    this.options = options;
    this.callbacks = [];

    this.form = false;
    this.uploader = false;
    this.uploads = false;
    this.form_file = false;

    this.uploads_queue = {};

    this.__init();
};

StorageUploader.prototype = {
    destroy: function() {
        if (this.uploader && this.uploader.removeEventListener) {
            this.uploader.removeEventListener(
                'drop',
                this.__uploaderOnDrop
            );

            this.uploader.removeEventListener(
                'dragenter',
                this.__uploaderOnDragEnter
            );

            this.uploader.removeEventListener(
                'dragover',
                this.__uploaderOnDragOver
            );

            this.uploader.removeEventListener(
                'dragleave',
                this.__uploaderOnDragLeave
            );
        }

        var elements = [
            'container',
            'uploader',
            'uploads',
            'form',
            'form_file',
        ];

        for (var element in elements) {
            element = elements[element];

            if (!this[element]) {
                continue;
            }

            this[element].innerHTML = '';

            if (this[element].__parent) {
                this[element].__parent = null;
            }

            if (this[element].parentNode && this[element].parentNode.removeChild) {
                this[element].parentNode.removeChild(this[element]);
            }

            this[element].onchange = null;
            this[element].onclick = null;
            this[element] = null;
        }

        if (this.uploads_queue) {
            for (var upload_id in this.uploads_queue) {
                this.__uploadRemove(upload_id);
            }
        }

        this.storage = null;
        this.options = null;
        this.callbacks = null;
    },

    onupload: function(callback) {
        if (typeof callback != 'function') {
            return;
        }

        if (!this.callbacks) {
            return;
        }

        this.callbacks.push(callback);
    },

    __init: function() {
        if (!this.container) {
            return false;
        }

        this.container.innerHTML = '';

        var uploader = document.createElement('div');
        uploader.className = 'storage__upload';
        uploader.innerHTML = Lang.get('storage.file_upload');

        var uploads = document.createElement('div');
        uploads.class = 'storage__uploads';

        var form = document.createElement('form');
        form.enctype = 'multipart/form-data';
        form.method = 'post';

        var input = document.createElement('input');
        input.name = 'upload';
        input.multiple = false;
        input.type = 'file';

        this.uploader = uploader;
        this.uploads = uploads;
        this.form = form;
        this.form_file = input;

        this.container.appendChild(form);
        this.container.appendChild(uploader);
        this.container.appendChild(uploads);

        form.appendChild(input);

        this.__watchUpload();
    },

    __watchUpload: function() {
        if (!this.container) {
            return;
        }

        this.uploader.__parent = this;
        this.uploader.onclick = this.__uploaderOnClick;

        this.form_file.__parent = this;
        this.form_file.onchange = this.__inputOnChange;

        this.uploader.__parent = this;

        if (this.uploader.addEventListener) {
            this.uploader.addEventListener(
                'drop',
                this.__uploaderOnDrop,
                false
            );

            this.uploader.addEventListener(
                'dragenter',
                this.__uploaderOnDragEnter,
                false
            );

            this.uploader.addEventListener(
                'dragover',
                this.__uploaderOnDragOver,
                false
            );

            this.uploader.addEventListener(
                'dragleave',
                this.__uploaderOnDragLeave,
                false
            );
        }
    },

    __uploaderOnDrop: function(e) {
        if (e.stopPropagation) e.stopPropagation();
        if (e.preventDefault) e.preventDefault();

        if (!this.__parent) {
            return;
        }

        var self = this.__parent;

        if (!self.container) {
            this.__parent = null;
            self = null;
            return;
        }

        this.className = 'storage__upload';

        if (!e.dataTransfer || !e.dataTransfer.files) {
            return false;
        }

        var files = e.dataTransfer.files;
        for (var i = 0; i < files.length; i++) {
            var form = new FormData();
            form.append('upload', files[i]);

            self.__uploadFile(form);
        }

        self = null;
    },

    __uploaderOnDragOver: function(e) {
        if (e.stopPropagation) e.stopPropagation();
        if (e.preventDefault) e.preventDefault();
    },

    __uploaderOnDragLeave: function(e) {
        if (e.stopPropagation) e.stopPropagation();
        if (e.preventDefault) e.preventDefault();

        this.className = 'storage__upload';
    },

    __uploaderOnDragEnter: function(e) {
        if (e.stopPropagation) e.stopPropagation();
        if (e.preventDefault) e.preventDefault();

        this.className = 'storage__upload storage__upload--hover';
    },

    __uploaderOnClick: function() {
        if (!this.__parent) {
            return;
        }

        var self = this.__parent;

        if (!self.container) {
            this.__parent = null;
            self = null;
            return;
        }

        self.form_file.click();
        self = null;
    },

    __inputOnChange: function() {
        if (!this.__parent) {
            return;
        }

        var self = this.__parent;

        if (!self.container) {
            this.__parent = null;
            self = null;
            return;
        }

        var form_data = new FormData(self.form);
        self.__uploadFile(form_data);

        form_data = null;
        self = null;
        this.value = null;
    },

    __uploadFile: function(form_data) {
        if (!this.container) { return; }

        var that = this;

        var upload_name = false;
        var upload_id = false;

        if (form_data.get) {
            var file = form_data.get('upload');

            if (file && file.name) {
                upload_name = file.name;
            }
        }

        var request_id = Rocky.ajax({
            url: '/ajax/storage/upload',
            data: form_data,

            success: function(file) {
                if (!that.container) return;

                that.__uploadSuccess(upload_id, file);

                that = null;
                upload_id = null;
            },

            error: function(error) {
                if (!that.container) return;

                that.__uploadError(upload_id, error);

                that = null;
                upload_id = null;
            },

            progress: function(loaded, total) {
                that.__uploadUpdateProgress(upload_id, loaded, total);
            },

            async: false,
        });

        upload_id = this.__uploadCreate(upload_name, request_id);
    },

    __uploadCreate: function(file_name, request_id) {
        if (typeof this.uploads_queue == 'undefined') {
            return false;
        }

        var upload_id = 0;

        for (var i = 0; ; ++i) {
            if (typeof this.uploads_queue[i] == 'object') {
                continue;
            }

            upload_id = i;
            break;
        }

        var uploader = document.createElement('div');
        uploader.className = 'storage__uploads-file';
        uploader.__parent = this;
        uploader.setAttribute('upload_id', upload_id)
        uploader.onclick = this.__uploadOnClick;

        var progress = document.createElement('div');
        progress.className = 'storage__uploads-progress';

        var title = document.createElement('div');
        title.className = 'storage__uploads-title';

        uploader.appendChild(progress);
        uploader.appendChild(title);
        this.uploads.appendChild(uploader);

        this.uploads_queue[upload_id] = {
            uploader: uploader,
            progress: progress,
            title: title,
            file_name: file_name,
            request_id: request_id,
            status: 'scheduled',
            error: false,
            loaded: 0,
            total: 0,
        };

        this.__uploadUpdate(upload_id);

        return upload_id;
    },

    __uploadUpdate: function(upload_id) {
        if (typeof this.uploads_queue != 'object') {
            return;
        }

        if (typeof this.uploads_queue[upload_id] != 'object') {
            return;
        }

        var upload = this.uploads_queue[upload_id];

        var title = upload.file_name;
        if (!title) {
            title = Lang.get('storage.upload_file_placeholder');
        }
        title += ' - ';

        if (upload.status == 'scheduled') {
            title += Lang.get('storage.upload_file_scheduled');

            upload.progress.style.display = 'none';
            upload.title.innerHTML = title;
        }
        else if (upload.status == 'uploading') {
            var percents = 0;
            if (upload.total) {
                percents = Math.floor((upload.loaded / upload.total) * 100);
            }

            title += Lang.get('storage.upload_file_uploading');
            title += ' (' + percents + '%)';

            upload.progress.style.display = 'block';
            upload.progress.style.width = percents + '%';
            upload.title.innerHTML = title;
        }
        else if (upload.status == 'success') {
            title += Lang.get('storage.upload_file_success');

            upload.progress.style.display = 'block';
            upload.progress.style.width = '100%';
            upload.title.innerHTML = title;
        }
        else if (upload.status == 'error') {
            title += upload.error;

            upload.progress.style.display = 'block';
            upload.progress.style.width = '100%';
            upload.progress.className += ' storage__uploads-progress--error';
            upload.title.innerHTML = title;
        }

        upload = null;
    },

    __uploadUpdateProgress: function(upload_id, loaded, total) {
        if (typeof this.uploads_queue != 'object') {
            return;
        }

        if (typeof this.uploads_queue[upload_id] != 'object') {
            return;
        }

        this.uploads_queue[upload_id].status = 'uploading';
        this.uploads_queue[upload_id].loaded = loaded;
        this.uploads_queue[upload_id].total = total;

        this.__uploadUpdate(upload_id);
    },

    __uploadSuccess: function(upload_id, file) {
        if (typeof this.uploads_queue != 'object') {
            return;
        }

        if (typeof this.uploads_queue[upload_id] != 'object') {
            return;
        }

        this.uploads_queue[upload_id].status = 'success';
        this.__uploadUpdate(upload_id);

        for (var callback in this.callbacks) {
            this.callbacks[callback](file);
        }
    },

    __uploadError: function(upload_id, error) {
        if (typeof this.uploads_queue != 'object') {
            return;
        }

        if (typeof this.uploads_queue[upload_id] != 'object') {
            return;
        }

        this.uploads_queue[upload_id].status = 'error';
        this.uploads_queue[upload_id].error = error;

        this.__uploadUpdate(upload_id);
    },

    __uploadAbort: function(upload_id) {
        if (typeof this.uploads_queue != 'object') {
            return;
        }

        if (typeof this.uploads_queue[upload_id] != 'object') {
            return;
        }

        var request_id = this.uploads_queue[upload_id].request_id;

        if (typeof request_id == 'undefined') {
            return;
        }

        if (request_id === false || request_id === null) {
            return;
        }

        Rocky.ajaxAbort(request_id);

        this.uploads_queue[upload_id].request_id = null;
        request_id = null;
    },

    __uploadRemove: function(upload_id) {
        if (typeof this.uploads_queue != 'object') {
            return;
        }

        if (typeof this.uploads_queue[upload_id] != 'object') {
            return;
        }

        this.__uploadAbort(upload_id);

        var upload = this.uploads_queue[upload_id];
        this.uploads_queue[upload_id] = null;

        if (upload.uploader.parentNode && upload.uploader.parentNode.removeChild) {
            upload.uploader.parentNode.removeChild(upload.uploader);
        }

        upload.uploader.onclick = null;
        upload.uploader.__parent = null;

        for (var key in upload) {
            upload[key] = null;
        }

        upload = null;
    },

    __uploadOnClick: function() {
        if (!this.__parent) {
            return;
        }

        var upload_id = parseInt(this.getAttribute('upload_id'));

        if (typeof this.__parent.uploads_queue != 'object') {
            return;
        }

        if (typeof this.__parent.uploads_queue[upload_id] != 'object') {
            return;
        }

        var status = this.__parent.uploads_queue[upload_id].status;

        if (status == 'scheduled' || status == 'uploading') {            
            this.__parent.__uploadAbort(upload_id);
        }
        else {
            this.__parent.__uploadRemove(upload_id);
        }
    },
}

var StorageDisplayOptions = function(container, storage, options) {
    this.container = container;
    this.storage = storage;
    this.options = options;
    this.callbacks = [];
    this.groups = [];

    this.__init();
};

StorageDisplayOptions.prototype = {
    destroy: function() {
        if (this.container) {
            this.container.innerHTML = '';

            if (this.container.parentNode) {
                this.container.parentNode.removeChild(this.container);
            }
        }

        this.container = null;
        this.storage = null;
        this.groups = null;
        this.options = null;
        this.callbacks = null;
    },

    getOrderBy: function() {
        if (!this.container) {
            return false;
        }

        return this.option_orderby;
    },

    getMedia: function() {
        if (!this.container) {
            return false;
        }

        if (this.option_media == 'all') {
            return this.options.media;
        }
        else {
            return [this.option_media];
        }
    },

    getGroup: function() {
        if (!this.container) {
            return false;
        }

        return this.option_group;
    },

    onchange: function(callback) {
        if (typeof callback != 'function') {
            return;
        }

        if (!this.callbacks) {
            return;
        }

        this.callbacks.push(callback);
    },

    __init: function() {
        if (!this.container) {
            return;
        }

        this.option_orderby = 'newest';
        this.option_media = 'all';
        this.option_group = 'all';

        if (this.options.group) {
            this.option_group = this.options.group;
            this.groups.push(this.options.group);
        }

        var media = this.options.media;
        if (media.length == 1) {
            this.option_media = media[0];
        }

        if (this.options.show_groups) {
            this.__loadGroups();
        }
        else {
            this.__showOptions();
        }
    },

    __loadGroups: function() {
        if (!this.container) {
            return;
        }

        var that = this;
        this.container.innerHTML = '<div class="nice-form__loader"></div>';

        Rocky.ajax({
            url: '/ajax/storage/getGroups',

            success: function(groups) {
                if (!that.container) {
                    that = null;
                    return;
                }

                that.__processLoadedGroups(groups);
                that = null;
            },

            error: function(error) {
                if (!that.container) {
                    that = null;
                    return;
                }

                that.container.innerHTML = '<div class="nice-form__error">' + error + '</div>';
                that = null;
            },

            data: {
                admin_mode: this.options.admin_mode
            },

            async: true,
        });
    },

    __processLoadedGroups: function(groups) {
        if (!this.container) {
            return;
        }

        var user_groups = {};

        if (this.options.group) {
            user_groups[this.options.group] = true;
        }

        for (var group in groups) {
            user_groups[groups[group]] = true;
        }

        this.groups = Object.keys(user_groups);
        this.__showOptions();
    },

    __showOptions: function() {
        if (!this.container) {
            return;
        }

        this.container.innerHTML = '';

        if (this.__makeOption_order()) {
            this.__makeOptionsSpacing();
        }

        if (this.__makeOption_media()) {
            this.__makeOptionsSpacing();
        }

        if (this.__makeOption_groups()) {
            this.__makeOptionsSpacing();
        }
    },

    __makeOptionsSpacing: function() {
        if (!this.container) {
            return;
        }

        var spacing = document.createElement('div');
        spacing.className = 'storage__options-spacing';

        this.container.appendChild(spacing);
    },

    __makeOption_order: function() {
        if (!this.container) {
            return;
        }

        var wrapper = document.createElement('div');
        wrapper.className = 'storage__options-group storage__options-group--orderby';

        var options = ['newest', 'popular'];

        for (var option in options) {
            option = options[option];

            this.__appendOptionButton({
                wrapper: wrapper,
                option_type: 'orderby',
                option_value: option,
                title: Lang.get('storage.orderby_' + option),
                selected: this.option_orderby == option,
            });
        }

        this.container.appendChild(wrapper);

        return true;
    },

    __makeOption_media: function() {
        if (!this.container) {
            return;
        }

        var wrapper = document.createElement('div');
        wrapper.className = 'storage__options-group storage__options-group--media';

        if (this.options.media.length > 1) {
            this.__appendOptionButton({
                wrapper: wrapper,
                option_type: 'media',
                option_value: 'all',
                title: Lang.get('storage.media_all'),
                selected: this.option_media == 'all',
            });
        }

        for (var media in this.options.media) {
            media = this.options.media[media];

            this.__appendOptionButton({
                wrapper: wrapper,
                option_type: 'media',
                option_value: media,
                title: Lang.get('storage.media_' + media),
                selected: this.option_media == media,
            });
        }

        this.container.appendChild(wrapper);

        return true;
    },

    __makeOption_groups: function() {
        if (!this.container) {
            return;
        }

        if (!this.options.show_groups) {
            return false;
        }

        if (!this.groups.length) {
            return false;
        }

        var wrapper = document.createElement('div');
        wrapper.className = 'storage__options-group storage__options-group--groups';

        if (this.groups.length) {
            this.__appendOptionButton({
                wrapper: wrapper,
                option_type: 'group',
                option_value: 'all',
                title: Lang.get('storage.groups_all'),
                selected: this.option_group == 'all',
            });
        }

        this.__appendOptionButton({
            wrapper: wrapper,
            option_type: 'group',
            option_value: 'groupless',
            title: Lang.get('storage.groups_groupless'),
            selected: this.option_group == 'groupless',
        });

        for (var group in this.groups) {
            group = this.groups[group];

            this.__appendOptionButton({
                wrapper: wrapper,
                option_type: 'group',
                option_value: group,
                title: group,
                selected: this.option_group == group,
            });
        }

        this.container.appendChild(wrapper);
        return true;
    },

    __appendOptionButton: function(info) {
        var button = document.createElement('a');
        button.className = 'storage__option';
        button.setAttribute('option_type', info.option_type);
        button.setAttribute('option_value', info.option_value);

        if (info.option_type == 'media') {
            var img = document.createElement('img');
            img.src = '/images/site/storage/media_' + info.option_value + '.png';

            button.appendChild(img);
        }

        button.appendChild(document.createTextNode(info.title));

        if (info.selected) {
            button.className += ' storage__option--selected';
        }

        button.__parent = this;
        button.onclick = this.__updateOption;

        info.wrapper.appendChild(button);
        info = null;
    },

    __updateOption: function() {
        if (!this.__parent) {
            return;
        }

        var self = this.__parent;

        if (!self.container) {
            return;
        }

        var option = this.getAttribute('option_type');
        var value = this.getAttribute('option_value');

        self['option_' + option] = value;
        self.__showOptions();

        for (var callback in self.callbacks) {
            self.callbacks[callback](option, value);
        }

        self = null;
    },
}

var StorageFiles = function(container, storage, options) {
    this.container = container;
    this.storage = storage;
    this.options = options;
    this.callbacks = [];
    this.page = 1;
    this.pages = 1;
    this.total = 0;
    this.files = [];

    this.__init();
};

StorageFiles.prototype = {
    destroy: function() {
        if (this.container) {
            this.container.innerHTML = '';

            if (this.container.parentNode) {
                this.container.parentNode.removeChild(this.container);
            }
        }

        this.container = null;
        this.storage = null;
        this.files = null;
        this.callbacks = null;
        this.page = null;
        this.pages = null;
        this.total = null;
        this.files = null;
        this.options = null;
    },

    onselect: function(callback) {
        if (typeof callback != 'function') {
            return;
        }

        if (!this.callbacks) {
            return;
        }

        this.callbacks.push(callback);
    },

    __init: function() {

        var that = this;

        this.storage.display.onchange(function() {
            that.__loadFiles();
        })

        this.__loadFiles();
    },

    __loadFiles: function() {
        if (!this.container) {
            return;
        }

        var that = this;
        this.container.innerHTML = '<div class="nice-form__loader"></div>';

        Rocky.ajax({
            url: '/ajax/storage/getFiles',

            success: function(response) {
                if (!that.container) {
                    that = null;
                    return;
                }

                that.page = response.page;
                that.pages = response.pages;
                that.total = response.total;
                that.files = response.files;

                that.__showFiles();
                that = null;
            },

            error: function(error) {
                if (!that.container) {
                    that = null;
                    return;
                }

                that.container.innerHTML = '<div class="nice-form__error">' + error + '</div>';
                that = null;
            },

            data: {
                admin_mode: this.options.admin_mode,
                media: this.storage.display.getMedia().join(','),
                group: this.storage.display.getGroup(),
                orderby: this.storage.display.getOrderBy(),
                page: this.page,
                pages: this.pages,
            },

            async: true,
        });
    },

    __showFiles: function() {
        if (!this.container) {
            return;
        }

        this.container.innerHTML = '';

        if (!this.files.length) {
            var error = document.createElement('div');
            error.className = 'nice-form__success';
            error.innerHTML = Lang.get('storage.error_files_not_found');

            this.container.appendChild(error);
            return;
        }

        console.log(this.files);
    },
}