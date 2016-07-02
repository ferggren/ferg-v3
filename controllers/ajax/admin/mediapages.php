<?php
class AjaxAdminMediaPages_Controller extends AjaxController {
    public static $user_auth = true;
    public static $user_access_level = 'admin';

    /**
     *  Default action
     */
    public function actionIndex() {
        return $this->jsonError('access denied');
    }

    /**
     *  Creates new media page and returns its id
     *
     *  @return {json} Created page id
     */
    public function actionCreate($page_group) {
        if (!($group = self::__getPagesGroup($page_group))) {
            return $this->jsonError('access denied');
        }

        $page = new MediaPages;
        $page->page_group = $group->group_name;
        $page->page_visible = 0;
        $page->page_deleted = 0;

        $page->save();

        MediaPagesGroups::updatePagesCount();

        return $this->jsonSuccess((int)$page->page_id);
    }

    /**
     *  Check group and return its object
     *
     *  @param {string} group_name Group name
     *  @return {object} Group object
     */
    protected static function __getPagesGroup($group_name) {
        if (!preg_match('#^[0-9a-zA-Z_-]{1,20}$#', $group_name)) {
            return false;
        }

        if (!($group = MediaPagesGroups::find($group_name))) {
            return false;
        }

        return $group;
    }
}
?>