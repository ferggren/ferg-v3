/**
 * @file MediaPages common utils
 * @name MediaPages
 * @author ferg <me@ferg.in>
 * @copyright 2016 ferg
 */

/**
 *  MediaPages common utils
 */
var MediaPages = {
	/**
	 *	Creates new media page and redirects user to page editor
	 *
	 *	@param {string} pages_group Page group
	 */
	create: function(page_group) {
		var loader = document.createElement('div');
		loader.className = 'nice-form__loader';

		var popup = Popup.createWindow({
			content: loader,
		});

		Rocky.ajax({
			url: '/ajax/admin/mediaPages/create/',

			success: function(page_id) {
				var link = '/';
				link += Lang.getLang();
				link += '/admin/pages/';
				link += page_group;
				link += '/';
				link += page_id;
				link += '/';

				window.location = link;
			},

			error: function(error) {
				Popup.closePopup(popup);

				var block = document.createElement('div');
				block.className = 'nice-form__error';
				block.innerHTML = error;

				Popup.createWindow({
					content: block,
				});
			},

			data: {
				page_group: page_group,
			}
		});
	},
}