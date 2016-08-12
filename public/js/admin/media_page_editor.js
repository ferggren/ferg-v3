/**
 * @file Media page's editor
 * @name MediaPageEditor
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

/**
 *  Editor for Media Pages
 */
var MediaPageEditor = function(options) {
    this.__init(options);
};

MediaPageEditor.prototype = {
    /**
     *  Destroy editor
     */
    destroy: function() {
        if (!this.page_id) {
            return;
        }

        for (var section in this.__sections) {
            if (this.__sections[section].destroy) {
                this.__sections[section].destroy();
            }

            this.__sections[section] = null;
        }

        this.__sections = null;

        for (var container in this.__containers) {
            this.__containers[container].innerHTML = '';
            this.__containers[container] = null;
        }

        this.__containers = null;

        if (this.container) {
            this.container.innerHTML = '';
            this.container = null;
        }

        this.page_id = false;
    },

    /**
     *  Group info
     */
    group: {},

    /**
     *  Page info
     */
    page: {},

    /**
     *  List of all containers
     */
    __containers: [],

    /**
     *  List of all sections
     */
     __sections: {},

    /**
     *  Constructor
     */
    __init: function(options) {
        this.page_id = false;

        if (!(options = this.__validateOptions(options))) {
            throw new Error('invalid options');
        }

        this.container = options.container;
        this.page_id = options.page_id;

        this.__loadPageInfo();
    },

    /**
     *  Load basic page info
     */
    __loadPageInfo: function() {
        var that = this;

        this.container.innerHTML = '<div class="nice-form__loader"></div>';

        Rocky.ajax({
            url: '/ajax/admin/mediaPages/getInfo/',

            success: function(info) {
                that.page = info.page;
                that.group = info.group;

                that.__makeSections();

                that = null;
            },

            error: function(error) {
                var block = document.createElement('div');
                block.innerHTML = error;
                block.className = 'nice-form__error';

                that.container.innerHTML = '';
                that.container.appendChild(block);
                that = null;
            },

            data: {
                page_id: this.page_id,
            }
        });
    },

    /**
     *  Options validator
     *
     *  @param {array} options Options list
     */
    __validateOptions: function(options) {
        if (typeof options != 'object') {
            return false;
        }

        if (typeof options.page_id == 'undefined') {
            return false;
        }

        options.page_id = parseInt(options.page_id);
        if (isNaN(options.page_id)) {
            return false;
        }

        if (typeof options.container == 'string') {
            options.container = document.getElementById(options.container);
        }

        if (typeof options.container != 'object') {
            return false;
        }

        return options;
    },

    /**
     *  Create all editor's sections
     */
    __makeSections: function() {
        this.__makeContainers();

        var sections = [
            'preview',
            'common',
            'tags',
            'media',
            'delete',
        ];

        for (var section in sections) {
            section = sections[section];

            if (typeof this.__containers[section] == 'undefined') {
                continue;
            }

            try {
                var obj = new window['MediaPageEditor_' + section](
                    this,
                    this.__containers[section]
                );
            }
            catch (e) {
                this.destroy();
                return;
            }

            this.__sections[section] = obj;
        }
    },

    /**
     *  Create containers
     */
    __makeContainers: function() {
        this.container.innerHTML = '';

        // MAIN WRAPPER
        var wrapper = document.createElement('div');
        wrapper.className = 'media-page-editor__wrapper';
        this.__containers.wrapper = wrapper;

        this.container.appendChild(wrapper);

        // PREVIEW
        if (this.group.preview_enabled) {
            var preview = document.createElement('div');
            preview.className = 'media-page-editor__preview-wrapper';

            wrapper.appendChild(preview);
            this.__containers.preview = preview;
        }

        // COMMON
        var common = document.createElement('div');
        common.className = 'media-page-editor__common-wrapper';
        this.__containers.common = common;

        // TAGS WRAPPER
        if (!this.group.tags_enabled) {
            wrapper.appendChild(common);
        }
        else {
            var tags = document.createElement('div');
            tags.className = 'media-page-editor__tags-wrapper';
            this.__containers.tags = tags;

            var left = document.createElement('div');
            left.className = 'media-page-editor__left-wrapper';

            var right = document.createElement('div');
            right.className = 'media-page-editor__right-wrapper';

            var clear = document.createElement('div');
            clear.className = 'floating-clear';

            wrapper.appendChild(left);
            wrapper.appendChild(right);
            wrapper.appendChild(clear);

            left.appendChild(common);
            right.appendChild(tags);
        }

        // MEDIA
        var media = document.createElement('div');
        media.className = 'media-page-editor__media-wrapper';
        this.__containers.media = media;

        wrapper.appendChild(media);

        // DELETE
        var destroy = document.createElement('div');
        destroy.className = 'media-page-editor__delete-wrapper';
        this.__containers.delete = destroy;

        wrapper.appendChild(destroy);
    },
}

/**
 *  Page preview
 */
MediaPageEditor_preview = function(editor, container) {
    this.__init(editor, container);
};

MediaPageEditor_preview.prototype = {
    /**
     *  Destroy preview
     */
    destroy: function() {
        this.container.innerHTML = '';
        this.container = null;
        this.editor = null;

        var elements = [
            "preview",
            "clear",
            "update",
        ];

        for (var element in elements) {
            element = elements[element];

            if (!this[element]) {
                continue;
            }

            this[element].__parent = null;
            this[element] = null;
        }
    },

    /**
     *  Init preview
     */
    __init: function(editor, container) {
        this.container = container;
        this.editor = editor;

        this.__makePreview();
    },

    /**
     *  Creates preview
     */
    __makePreview: function() {
        this.container.innerHTML = '';

        var info = this.editor.page.preview;

        var preview = document.createElement('div');
        preview.className = 'media-page-editor__preview';
        preview.__parent = this;

        var clear = document.createElement('div');
        clear.className = 'media-page-editor__preview-clear';
        clear.innerHTML = Lang.get('media_pages.preview_clear');
        clear.__parent = this;
        clear.onclick = this.__clearPreview;

        var update = document.createElement('div');
        update.className = 'media-page-editor__preview-update';
        update.innerHTML = Lang.get('media_pages.preview_update');
        update.__parent = this;
        update.onclick = this.__selectPreview;

        this.preview = preview;
        this.clear = clear;
        this.update = update;

        preview.appendChild(update);
        preview.appendChild(clear);
        
        this.container.appendChild(preview);

        this.__showPreview();
    },

    /**
     *  Show select preview dialog
     */
    __selectPreview: function() {
        if (!this.__parent || !this.__parent.editor) {
            return;
        }

        var parent = this.__parent;
        var container = document.createElement('div');
        var storage_group = "media_pages_" + parent.editor.page_id + "_preview";
        var popup = 0;

        var storage = new Storage({
            container: container,

            onselect: function(file) {
                parent.__updatePreview(file);

                Popup.closeWindow(popup);
                storage.destroy();
                parent = null;
            },

            onupload: function(file) {
                parent.__updatePreview(file);

                Popup.closeWindow(popup);
                storage.destroy();
                parent = null;
            },

            display: {
                media: ["image"],
                group: storage_group,
            },

            upload: {
                media: ["image"],
                group: storage_group,
            },
        });

        popup = Popup.createWindow({
            content: container,

            onclose: function() {
                storage.destroy();
                parent = null;
            },
        });
    },

    /**
     *  Update preview
     *
     *  @param {object} file Preview file
     */
    __updatePreview: function(file) {
        if (!this.editor) {
            return;
        }

        if (file.media != "image") {
            return;
        }

        if (!file.link_preview) {
            return;
        }

        var that = this;

        var loader = document.createElement('div');
        loader.className = 'nice-form__loader';

        var loader_popup = Popup.createWindow({content: loader});

        Rocky.ajax({
            url: "/ajax/admin/mediaPages/updatePreview/",

            success: function(preview_link) {
                Popup.closeWindow(loader_popup);

                that.editor.page.preview = {
                    hash: file.hash,
                    link: preview_link,
                };

                that.__showPreview();
                that = null;
            },

            error: function(error) {
                Popup.closeWindow(loader_popup);
                
                var container = document.createElement('div');
                container.className = 'nice-form__error';
                container.innerHTML = error;

                Popup.createWindow({content: container});
                that = null;
            },

            data: {
                page_id: this.editor.page_id,
                preview: file.hash,
            }
        });
    },

    /**
     *  Show preview & clear button
     */
    __showPreview: function() {
        if (!this.editor) {
            return;
        }

        var preview = this.editor.page.preview;

        if (!preview) {
            this.clear.style.display = 'none';
            this.preview.style.backgroundImage = '';
        }
        else {
            this.clear.style.display = 'block';
            this.preview.style.backgroundImage = "url('" + preview.link + "')";
        }
    },

    /**
     *  Clear page preview
     */
    __clearPreview: function(e) {
        if (e.stopPropagation) e.stopPropagation();
        if (e.preventDefault) e.preventDefault();

        if (!this.__parent) {
            return;
        }

        var parent = this.__parent;

        var loader = document.createElement('div');
        loader.className = 'nice-form__loader';

        var loader_popup = Popup.createWindow({content: loader});

        Rocky.ajax({
            url: "/ajax/admin/mediaPages/clearPreview/",

            success: function(preview_link) {
                Popup.closeWindow(loader_popup);

                parent.editor.page.preview = false;

                parent.__showPreview();
                parent = null;
            },

            error: function(error) {
                Popup.closeWindow(loader_popup);
                
                var container = document.createElement('div');
                container.className = 'nice-form__error';
                container.innerHTML = error;

                Popup.createWindow({content: container});
                parent = null;
            },

            data: {
                page_id: parent.editor.page_id,
            }
        });
    }
};

/**
 *  Page tags
 */
MediaPageEditor_tags = function(editor, container) {
    this.__init(editor, container);
};

MediaPageEditor_tags.prototype = {
    destroy: function() {
        this.container.innerHTML = '';
        this.container = null;
        this.editor = null;
    },

    __init: function(editor, container) {
        this.container = container;
        this.editor = editor;

        this.container.innerHTML = 'TAGS';
    },
};

/**
 *  Page common
 */
MediaPageEditor_common = function(editor, container) {
    this.__init(editor, container);
};

MediaPageEditor_common.prototype = {
    destroy: function() {
        this.container.innerHTML = '';
        this.container = null;
        this.editor = null;
    },

    __init: function(editor, container) {
        this.container = container;
        this.editor = editor;

        this.container.innerHTML = 'COMMON';
    },
};

/**
 *  Page media
 */
MediaPageEditor_media = function(editor, container) {
    this.__init(editor, container);
};

MediaPageEditor_media.prototype = {
    destroy: function() {
        this.container.innerHTML = '';
        this.container = null;
        this.editor = null;
    },

    __init: function(editor, container) {
        this.container = container;
        this.editor = editor;

        this.container.innerHTML = 'MEDIA';
    },
};

/**
 *  Page delete
 */
MediaPageEditor_delete = function(editor, container) {
    this.__init(editor, container);
};

MediaPageEditor_delete.prototype = {
    destroy: function() {
        this.container.innerHTML = '';
        this.container = null;
        this.editor = null;
    },

    __init: function(editor, container) {
        this.container = container;
        this.editor = editor;

        this.container.innerHTML = 'DELETE';
    },
};