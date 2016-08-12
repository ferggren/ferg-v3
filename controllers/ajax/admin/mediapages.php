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
     *  Return page info
     *
     *  @param {number} page_id Page id
     *  @return {json} Page info
     */
    public function actionGetInfo($page_id) {
        if (!($page = self::__getPageInfo($page_id))) {
            return $this->jsonError('access denied');
        }

        if (!($group = self::__getPagesGroup($page->page_group))) {
            return $this->jsonError('access denied');
        }

        $preview = false;

        if ($page->page_preview) {
            if ($preview_link = self::__getPreviewLink($page->page_preview)) {
                $preview = array(
                    'hash' => $page->page_preview,
                    'link' => $preview_link,
                );
            }
        }

        $ret = array(
            'page' => array(
                'group' => $page->page_group,
                'date' => $page->page_date,
                'url' => $page->page_url,
                'visible' => !!$page->page_visible,
                'versions' => $page->page_versions ? explode(',', $row->page_versions) : array(),
                'preview' => $preview,
            ),
            'group' => array(
                'tags_type' => is_null($group->tags_lang_type) ? false : $group->tags_lang_type,
                'tags_enabled' => !!$group->tags_enabled,
                'preview_enabled' => !!$group->preview_enabled,
            ),
        );

        return $this->jsonSuccess($ret);
    }

    /**
     *  Creates new media page and returns its id
     *
     *  @param {string} page_group Pages group name
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
     *  Update page preview
     *
     *  @param {number} page_id Page id
     *  @param {string} preview Preview hash
     *  @return {json} Preview link
     */
    public function actionUpdatePreview($page_id, $preview) {
        if (!($page = self::__getPageInfo($page_id))) {
            return $this->jsonError('access denied');
        }

        if (!($group = self::__getPagesGroup($page->page_group))) {
            return $this->jsonError('access denied');
        }

        if (!$group->preview_enabled) {
            return $this->jsonError('access denied');
        }

        if (!is_string($preview) || !preg_match('#^[0-9a-zA-Z_-]{8,10}$#', $preview)) {
            return $this->jsonError('incorrect preview');
        }

        if (!($preview_link = self::__getPreviewLink($preview))) {
            return $this->jsonError('incorrect preview');
        }

        $page->page_preview = $preview;
        $page->save();

        return $this->jsonSuccess($preview_link);
    }

    /**
     *  Clear page preview
     *
     *  @param {number} page_id Page id
     *  @return {json} Success
     */
    public function actionClearPreview($page_id) {
        if (!($page = self::__getPageInfo($page_id))) {
            return $this->jsonError('access denied');
        }

        if (!($group = self::__getPagesGroup($page->page_group))) {
            return $this->jsonError('access denied');
        }

        if (!$group->preview_enabled) {
            return $this->jsonError('access denied');
        }

        $page->page_preview = '';
        $page->save();

        return $this->jsonSuccess();
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

    /**
     *  Return page info
     *
     *  @param {number} page_id Page id
     *  @return {object} Page info
     */
    protected static function __getPageInfo($page_id) {
        if (!preg_match('#^\d{1,10}$#', $page_id)) {
            return false;
        }

        if (!($page = MediaPages::find($page_id))) {
            return false;
        }

        if ($page->deleted) {
            return false;
        }

        return $page;
    }

    /**
     *  Return preview file
     *
     *  @param {string} hash Preview hash
     *  @return {object} Preview file
     */
    protected static function __getPreview($hash) {
        $preview = StorageFiles::where('file_hash', '=', $hash);
        $preview = $preview->get();

        if (count($preview) != 1) {
            return false;
        }

        $preview = $preview[0];

        if ($preview->file_deleted) {
            return false;
        }

        if ($preview->file_media != 'image') {
            return false;
        }

        if (!$preview->file_preview) {
            return false;
        }

        return $preview;
    }

    /**
     *  Return preview link
     *
     *  @param {string} hash Preview hash
     *  @return {object} Preview link
     */
    protected static function __getPreviewLink($hash) {
        if (!($file = self::__getPreview($hash))) {
            return false;
        }

        $preview = $file->getPreviewLink(array(
            'width' => 900,
            'height' => 150,
            'crop' => true,
            'valign' => 'top',
            'align' => 'center',
        ));

        if (!$preview) {
            return false;
        }

        return $preview;
    }
}
?>