<?php
class AjaxStorage_Controller extends AjaxController {
    /**
     *  Return access error
     */
    public function actionIndex() {
        return $this->jsonError('access_denied');
    }

    /**
     *  Return user groups
     *
     *  @return {object} Groups
     */
    public function actionGetGroups() {
        if (!is_array($groups = $this->__loadUserGroups())) {
            return $this->jsonError('internal_server_error');
        }

        $ret = array();

        foreach ($groups as $group) {
            $ret[] = $group['name'];
        }

        return $this->jsonSuccess($ret);
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

        $media = self::__validateMedia($media);

        if ($admin_mode) {
            $groups = array();
            $media = self::__loadMediaStats($media, true);
        }
        else {
            $groups = self::__loadGroupsStats();
            $media = self::__loadMediaStats($media);
        }

        return $this->jsonSuccess(
            array(
                'media' => $media,
                'groups' => $groups,
            )
        );
    }

    /**
     *  Get files list
     */
    public function actionGetFiles() {
        $ret = array(
            'files' => array(),
            'page' => 1,
            'pages' => 1,
            'total' => 0,
            'rpp' => Config::get('storage.results_per_page'),
        );

        $search = self::__validateSearch();

        if (!User::isAuthenticated()) {
            return $this->jsonSuccess($ret);
        }

        // Nothing to return
        if (!count($search['media'])) {
            return $this->jsonSuccess($ret);
        }

        // where query
        $where = array();

        // User id & user group
        if (!$search['admin_mode']) {
            $where[] = 'user_id = "' . Database::escape(User::get_user_id()) . '"';

            if ($search['group_id'] !== false) {
                $where[] = 'group_id = "' . Database::escape($search['group_id']) . '"';
            }
        }

        // media
        $where_media = array();
        foreach ($search['media'] as $media) {
            $where_media[] = '"' . Database::escape($media) . '"';
        }

        $where[] = 'file_media IN (' . implode(',', $where_media) . ')';
        $where[] = 'file_deleted = "0"';
        $where = implode(' AND ', $where);

        // Count, pages & page
        $count = Database::query(
            'SELECT
                COUNT(*) as count
            FROM
                storage_files
            WHERE
                ' . $where
        );

        if (!isset($count[0]['count']) || !$count[0]['count']) {
            return $this->jsonSuccess($ret);
        }

        $count = (int)$count[0]['count'];
        $rpp = $ret['rpp'];
        $pages = (int)($count / $rpp);
        if (($pages * $rpp) < $count) ++$pages;

        if ($search['page'] > $pages) {
            $search['page'] = $pages;
        }

        // Files
        $files = Database::query(
            'SELECT
                *
            FROM
                storage_files
            WHERE
                ' . $where . '
            ORDER BY
                ' . ($search['orderby'] == 'popular' ? 'file_downloads' : 'file_id') . '
                DESC 
            LIMIT
                ' . (($search['page'] - 1) * $rpp) . ', ' . $rpp
        );

        if (!count($files)) {
            return $this->jsonSuccess($ret);
        }

        $ret['page'] = $search['page'];
        $ret['pages'] = $pages;
        $ret['total'] = $count;

        foreach ($files as $file) {
            $file = new StorageFile($file);

            if (!$file->exists()) {
                // wtf?
                continue;
            }

            if ($file->isDeleted()) {
                continue;
            }

            $info = $file->getInfo();

            $ret['files'][] = $file->getInfo();
        }

        return $this->jsonSuccess($ret);
    }

    /**
     *  Uplaod file statistic
     *  All information is taken from $_FILES AND $_POST
     *
     *  @return {object} Uploaded file info
     */
    public function actionUpload() {
        // If file even uploaded?
        if (!isset($_FILES) || !is_array($_FILES)) {
            return $this->jsonError(
                Lang::get('storage.error_file_not_uploaded')
            );
        }

        if (!isset($_FILES['upload']) || !is_array($_FILES['upload'])) {
            return $this->jsonError(
                Lang::get('storage.error_file_not_uploaded')
            );
        }

        $upload = $_FILES['upload'];

        // Any errors here?
        if (isset($upload['error']) && $upload['error']) {
            // No arrays are allowed here
            if (is_array($upload['error'])) {
                return $this->jsonError(
                    Lang::get('storage.error_file_upload_error')
                );
            }

            $error = $upload['error'];

            if ($error == UPLOAD_ERR_NO_FILE) {
                return $this->jsonError(
                    Lang::get('storage.error_file_not_uploaded')
                );
            }

            if ($error == UPLOAD_ERR_INI_SIZE || $error == UPLOAD_ERR_FORM_SIZE) {
                return $this->jsonError(
                    Lang::get('storage.error_file_is_too_big')
                );
            }

            return $this->jsonError(
                Lang::get('storage.error_file_not_uploaded')
            );
        }

        // check fields
        foreach (array('name', 'tmp_name') as $field) {
            if (isset($upload[$field]) && !is_array($upload[$field])) {
                continue;
            }

            return $this->jsonError(
                Lang::get('storage.error_file_upload_error')
            );
        }

        // get file info
        if (!is_array($file_info = self::__processUploadedFile($upload))) {
            if ($file_info) {
                return $this->jsonError($file_info);
            }

            return $this->jsonError(
                Lang::get('storage.error_file_upload_error')
            );
        }

        // get user id
        if (!($file_info['user_id'] = self::__getUserId())) {
            return $this->jsonError(
                Lang::get('storage.error_file_upload_error')
            );
        }

        // get group id
        $file_info['group_id'] = self::__getGroupId($file_info);

        // get file hash
        if (!($file_info['hash'] = self::__makeFileHash($file_info))) {
            return $this->jsonError(
                Lang::get('storage.error_file_upload_error')
            );
        }

        // move file
        if (!($file_info['path'] = self::__moveUploadedFile($file_info))) {
            return $this->jsonError(
                Lang::get('storage.error_file_upload_error')
            );
        }

        // create entry
        $file = new Database('storage_files');
        $file->user_id = $file_info['user_id'];
        $file->group_id = $file_info['group_id'];
        $file->file_hash = $file_info['hash'];
        $file->file_name = $file_info['name'];
        $file->file_media = $file_info['media'];
        $file->file_path = $file_info['path'];
        $file->file_deleted = 0;
        $file->file_size = $file_info['size'];
        $file->file_uploaded = time();
        $file->file_downloads = 0;
        $file->file_last_download_time = 0;
        $file->file_last_download_ip = 0;
        $file->file_preview = $file_info['preview'] ? '1' : '0';
        $file->file_access = $file_info['access'];

        $file->save();

        $file = new StorageFile($file);

        if (!$file->exists()) {
            return $this->jsonError(
                Lang::get('storage.error_file_upload_error')
            );
        }

        $info = $file->getInfo();

        // return file info
        return $this->jsonSuccess($info);
    }

    public function actionGetFileStats() {
        return $this->jsonSuccess(array());
    }

    /**
     * Validate user media
     *
     *  @param {string} user_media List of comma-separated media types
     *  @return {array} List of validated media types
     */
    protected static function __validateMedia($user_media) {
        $valid_media = array(
            'image',
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
     *  Return user groups
     *
     *  @return {array} List of user groups
    */
    protected static function __loadUserGroups() {
        if (!User::isAuthenticated()) {
            return array();
        }

        $groups = Database::from('storage_groups');
        $groups->whereAnd('user_id', '=', User::get_user_id());

        if (!($groups = $groups->get())) {
            return array();
        }

        $ret = array();

        foreach ($groups as $group) {
            $ret[] = array(
                'id' => $group->group_id,
                'name' => $group->group_name,
            );
        }

        return $ret;
    }

    /**
     *  Return user groups statistics
     *
     * 
     */
    protected static function __loadGroupsStats() {
        if (!User::isAuthenticated()) {
            return array();
        }

        if (!is_array($groups = self::__loadUserGroups())) {
            return array();
        }

        if (!count($groups)) {
            return array();
        }

        $map = array(
            '0' => 'groupless',
        );

        foreach ($groups as $group) {
            $map[$group['id']] = $group['name'];
        }

        $res = Database::query(
            'SELECT
                COUNT(*) as count,
                group_id
            FROM
                storage_files
            WHERE
                user_id = "'.Database::escape(User::get_user_id()).'"
                AND file_deleted = "0"
            GROUP BY
                group_id'
        );

        if (!$res || !is_array($res)) {
            return array();
        }

        $stats = array();

        foreach ($res as $stat) {
            if (!isset($map[$stat['group_id']])) {
                continue;
            }

            $stats[$map[$stat['group_id']]] = (int)$stat['count'];
        }

        return $stats;
    }

    /**
     *  Return user/global media types statistics
     *
     *  @param {array} user_media List of media types
     *  @param {boolean} global Return all statistics
     *  @return {array} List of media types with statistics
     */
    protected static function __loadMediaStats($user_media, $global = false) {
        $stats = array();

        if (!count($user_media) || !User::isAuthenticated()) {
            return $stats;
        }

        if (!User::hasAccess('admin')) {
            $global = false;
        }

        $where = array();

        if (!$global) {
            $where[] = 'user_id = "'.Database::escape(User::get_user_id()).'"';
        }

        $where_media = array();
        foreach ($user_media as $media) {
            $stats[$media] = 0;
            $where_media[] = '"' . Database::escape($media) . '"';
        }

        $where[] = 'file_media IN (' . implode(',', $where_media) . ')';
        $where[] = 'file_deleted = "0"';
        $where = implode(' AND ', $where);

        $res = Database::query(
            'SELECT
                COUNT(*) as count,
                file_media
            FROM
                storage_files
            WHERE
                ' . $where . '
            GROUP BY
                file_media'
        );

        if (!$res || !is_array($res)) {
            return array();
        }

        foreach ($res as $stat) {
            $stats[$stat['file_media']] = (int)$stat['count'];
        }

        return $stats;
    }

    /**
     *  Validate and prepare uploaded file
     *
     *  @param {array} upload File info from $_FILES
     *  @return {array} File processed info
     */
    protected static function __processUploadedFile($upload) {
        $info = array();

        // file name
        $upload['name'] = str_replace(
            array("\r", "\n", "\t", "\\", ':'),
            array(' ', ' ', ' ', '', ''),
            $upload['name']
        );

        if (strlen($upload['name']) > 70) {
            return Lang::get('storage.error_filename_too_big');
        }

        $info['name'] = $upload['name'];

        // check tmp path
        if (!file_exists($upload['tmp_name'])) {
            return $this->jsonError(
                Lang::get('storage.error_file_upload_error')
            );
        }
        $info['tmp_path'] = $upload['tmp_name'];

        // check file size
        $info['size'] = filesize($upload['tmp_name']);

        if ($info['size'] <= 0) {
            return Lang::get('storage.error_file_is_empty');
        }

        if ($info['size'] > Config::get('storage.max_filesize')) {
            return Lang::get('storage.error_file_is_too_big');
        }
        // file media
        $info['media'] = Storage::getFileMedia($info['name']);

        // access level
        $info['access'] = 'public';

        if (isset($_POST['file_access']) && $_POST['file_access'] == 'private') {
            $info['access'] = 'private';
        }

        // check if file meets required media type
        // media type is specified in storage widget
        if (!isset($_POST['file_media'])) {
            return Lang::get('storage.error_incorrect_media_type');
        }

        if (!($media = self::__validateMedia($_POST['file_media']))) {
            return Lang::get('storage.error_incorrect_media_type');
        }

        if (!in_array($info['media'], $media)) {
            return Lang::get('storage.error_incorrect_media_type');
        }

        // check if preview available
        $info['preview'] = Storage::checkPreviewFeature($info);

        return $info;
    }

    /**
     *  Return user_id of user, who uploaded file
     *  If user is not authenticated, creates a new user
     *
     *  @return {strgin} File owner id
     */
    protected static function __getUserId() {
        if (User::isAuthenticated()) {
            return User::get_user_id();
        }

        $user = new Users;
        $user->save();

        Session::login($user->user_id);

        return $user->user_id;
    }
    
    /**
     *  Return id of files group (if specified)
     *
     *  @param {array} file_info uploaded file info
     *  @return {strgin} Group id
     */
    protected static function __getGroupId($file_info) {
        if (!$file_info['user_id']) {
            return false;
        }

        if (!isset($_POST['file_group']) || !is_string($_POST['file_group'])) {
            return false;
        }

        $file_group = strtolower($_POST['file_group']);

        if (!preg_match('#^[0-9a-z_-]{1,30}$#', $file_group)) {
            return false;
        }

        $res = Database::from('storage_groups');
        $res->whereAnd('user_id', '=', $file_info['user_id']);
        $res->whereAnd('group_name', '=', $file_group);
        $res = $res->get();

        if (!is_array($res)) {
            return false;
        }

        if (count($res)) {
            return $res[0]->group_id;
        }

        $group = new Database('storage_groups');
        $group->user_id = $file_info['user_id'];
        $group->group_name = $file_group;
        $group->save();

        return $group->group_id;
    }

    /**
     *  Generates uniq hash for file
     *
     *  @param {array} file_info uploaded file info
     *  @return {strgin} File hash
     */
    protected static function __makeFileHash($file_info) {
        while (true) {
            if (!($hash = makeRandomString(8))) {
                return false;
            }

            $res = Database::from('storage_files');
            $res->whereAnd('file_hash', '=', $hash);
            $count = $res->count();

            if (!$count) {
                return $hash;
            }
        }
    }

    /**
     *  Generates path for uploaded file & moves it
     *
     *  @param {array} file_info uploaded file info
     *  @return {strgin} Generated file path
     */
    protected static function __moveUploadedFile($file_info) {
        $path  = '/uploads/';

        for ($i = 0; $i <= 1; ++$i) {
            $path .=  substr($file_info['hash'], $i, 1) . '/';

            if (is_dir(ROOT_PATH . $path)) {
                continue;
            }

            $oldumask = umask(0);
            mkdir(
                ROOT_PATH . $path,
                octdec(str_pad('755', 4, '0', STR_PAD_LEFT)),
                true
            );
            umask($oldumask);
        }

        $path .= $file_info['hash'];

        if (file_exists(ROOT_PATH . $path)) {
            return false;
        }

        if (!(copy($file_info['tmp_path'], ROOT_PATH . $path))) {
            return false;
        }

        return $path;
    }
    /**
     *  Validate search data
     *
     *  @return {array} Search params
     */
    protected static function __validateSearch() {
        // validate data
        $fields = array(
            'media',
            'group',
            'orderby',
            'page',
        );

        $info = array();
        foreach ($fields as $field) {
            $info[$field] = false;

            if (!isset($_POST[$field])) {
                continue;
            }

            if (!is_numeric($_POST[$field]) && !is_string($_POST[$field])) {
                continue;
            }

            $value = $_POST[$field];

            if (!preg_match('#^[0-9a-zA-Z_,-]++$#', $value)) {
                continue;
            }

            $info[$field] = $value;
        }

        // admin mode
        $info['admin_mode'] = false;
        if (isset($_POST['admin_mode']) &&
            $_POST['admin_mode'] &&
            User::hasAccess('admin')
            ) {
            $info['admin_mode'] = true;
        }

        // group id
        $info['group_id'] = $info['group'] == 'groupless' ? 0 : false;
        if ($info['group']) {
            foreach (self::__loadUserGroups() as $group) {
                if ($group['name'] != $info['group']) {
                    continue;
                }

                $info['group_id'] = $group['id'];
                break;
            }
        }

        // orderby
        $info['orderby'] = $info['orderby'] == 'newest' ? 'newest' : 'popular';

        // media
        $info['media'] = self::__validateMedia($info['media']);

        // page
        if (preg_match('#^[0-9]{1,5}$#', $info['page'])) {
            $info['page'] = (int)$info['page'];
        }
        else {
            $info['page'] = 1;
        }

        if ($info['page'] <= 0 || $info['page'] >= 200) {
            $info['page'] = 1;
        }

        return $info;
    }
}
?>