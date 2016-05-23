<?php
class AjaxStorage_Controller extends AjaxController {
    /**
     *  Return access error
     */
    public function actionIndex() {
        return $this->jsonError('access_denied');
    }

    /**
     *  Return statistic
     *  Media - number of user files of each media type
     *  Groups - number of user files of each group
     *
     *  If admin_mode is enabled (and user is admin),
     *  Function returns statistics about all files
     *
     *  @param {boolean} admin_mode Return statistic about all files
     *  @param {string} media List of comma-separated media types
     *  @return {object} Media and group statistic
     */
    public function actionGetStats($admin_mode = false, $media = '') {
        $admin_mode = !!$admin_mode;
        if ($admin_mode && !User::hasAccess('admin')) {
            $admin_mode = false;
        }

        $media = self::validateMedia($media);

        if ($admin_mode) {
            $groups = array();
            $media = self::loadMediaStatus($media, true);
        }
        else {
            $groups = self::loadUserGroups();
            $media = self::loadMediaStatus($media);
        }

        return $this->jsonSuccess(
            array(
                'media' => $media,
                'groups' => $groups,
            )
        );
    }

    /**
     *  Return files info
     */
    public function actionGetFiles() {
        return $this->jsonSuccess(array(
            'files' => array(),
            'page' => 1,
            'pages' => 1,
            'total' => 0,
        ));
    }

    /**
     * Validate user media
     *
     *  @param {string} user_media List of comma-separated media types
     *  @return {array} List of validated media types
     */
    protected static function validateMedia($user_media) {
        $valid_media = array(
            'photo',
            'video',
            'audio',
            'document',
            'source',
            'archive',
            'other'
        );

        if (!is_string($user_media)) {
            $user_media = '';
        }

        if (!preg_match('#^[0-9a-z,]{1,100}$#', $user_media)) {
            $user_media = '';
        }

        $user_media = explode(',', $user_media);

        $_user_media_valid = array();
        foreach ($user_media as $media) {
            if (!in_array($media, $valid_media)) {
                continue;
            }

            $_user_media_valid[] = $media;
        }

        $user_media = $_user_media_valid;

        if (!count($user_media)) {
            $user_media = $valid_media;
        }

        return $user_media;
    }

    /**
     *  Return statistics about user files groups
     *
     *  @return {array} List of user groups
     */
    protected static function loadUserGroups() {
        return array();
    }

    /**
     *  Return user/global media types statistics
     *
     *  @param {array} user_media List of media types
     *  @param {boolean} global Return all statistics
     *  @return {array} List of media types with statistics
     */
    protected static function loadMediaStatus($user_media, $global = false) {
        $media_stats = array();

        foreach ($user_media as $media) {
            $media_stats[$media] = 0;
        }

        if (!User::isAuthenticated()) {
            return $media_stats;
        }

        print_r($media_stats);
        exit;
    }
}
?>