<?php
class StorageFile {
    protected static $fields = array(
        'file_id',
        'user_id',
        'group_id',
        'file_hash',
        'file_name',
        'file_media',
        'file_path',
        'file_deleted',
        'file_size',
        'file_uploaded',
        'file_downloads',
        'file_last_download_time',
        'file_last_download_ip',
        'file_preview',
        'file_access',
    );

    protected $file;

    public function __construct($file) {
        $this->file = false;

        if (is_array($file)) {
            $this->__initByArray($file);
        }

        else if (is_numeric($file)) {
            $this->__initById($file);
        }

        else if (is_string($file)) {
            $this->__initByHash($file);
        }

        else if (is_object($file)) {
            $this->__initByObject($file);
        }
    }

    public function getInfo() {
        if (!$this->exists()) {
            return false;
        }

        $info = array(
            'id' => (int)$this->file['file_id'],
            'name' => $this->file['file_name'],
            'media' => $this->file['file_media'],
            'uploaded' => (int)$this->file['file_uploaded'],
            'downloads' => (int)$this->file['file_downloads'],
            'size' => (int)$this->file['file_size'],
            'preview' => !!$this->file['file_preview'],
            'hash' => $this->file['file_hash'],
            'group' => false,
            'link_download' => $this->getDownloadLink(),
        );

        if ($this->file['group_id']) {
            $info['group'] = self::__getGroupName($this->file['group_id']);
        }

        if ($this->file['file_preview']) {
            $info['link_preview'] = $this->getpreviewLink();
        }

        return $info;
    }

    public function hasPreview() {
        if (!$this->exists()) {
            return false;
        }

        return !!$this->file['file_preview'];
    }

    public function isDeleted() {
        if (!$this->exists()) {
            return true;
        }

        return !!$this->file['file_deleted'];
    }

    public function getDownloadLink() {
        if (!$this->exists()) {
            return false;
        }

        if ($this->isDeleted()) {
            return false;
        }

        $link = self::__makeLinkAddress();
        $link .= '/dl/';
        $link .= $this->file['file_hash'];

        return $link;
    }

    public function getPreviewLink($options = array()) {
        if (!$this->exists()) {
            return false;
        }

        if ($this->isDeleted()) {
            return false;
        }

        return false;
    }

    public function userHasAccess($user_id = false) {
        if (!$this->exists()) {
            return false;
        }

        if ($this->isDeleted()) {
            return false;
        }

        if (!is_numeric($user_id)) {
            if (User::isAuthenticated()) {
                $user_id = User::get_user_id();
            }
        }

        if ($this->file_access == 'public') {
            return true;
        }

        return $user_id == $this->file['user_id'];
    }

    public function exists() {
        return is_array($this->file);
    }

    protected function __initByArray($list) {
        $init = true;
        $file = array();

        foreach (self::$fields as $field) {
            if (!isset($list[$field])) {
                $init = false;
                break;
            }

            $file[$field] = $list[$field];
        }

        if (!$init) {
            if (isset($list['file_id'])) {
                return self::__initById($list['file_id']);
            }

            if (isset($list['file_hash'])) {
                return self::__initByHash($list['file_hash']);
            }

            return false;
        }

        $this->file = $file;

        return true;
    }

    protected function __initByObject($object) {
        $init = true;
        $file = array();

        foreach (self::$fields as $field) {
            $value = $object->$field;

            if ($value === null) {
                $init = false;
                break;
            }

            $file[$field] = $value;
        }

        if (!$init) {
            if ($object->file_id !== null) {
                return self::__initById($object->file_id);
            }

            if ($object->file_hash !== null) {
                return self::__initByHash($object->file_hash);
            }

            return false;
        }

        $this->file = $file;

        return true;
    }

    protected function __initByHash($hash) {
        if (!preg_match('#^[0-9a-zA-Z_-]{8}$#')) {
            return false;
        }

        $file = Database::from('storage_files');
        $file->whereAnd('file_hash', '=', $hash);

        $file = $file->get();

        if (!is_array($file) || count($file) != 1) {
            return false;
        }

        return self::__initByObject($file[0]);
    }

    protected function __initById($id) {
        if (!preg_match('#^[0-9]{1,10}$#')) {
            return false;
        }

        $file = Database::from('storage_files');
        $file->whereAnd('file_id', '=', $id);

        $file = $file->get();

        if (!is_array($file) || count($file) != 1) {
            return false;
        }

        return self::__initByObject($file[0]);
    }

    protected static function __getGroupName($group_id) {
        static $groups = array();

        if (!$group_id) {
            return false;
        }

        if (isset($groups[$group_id])) {
            return $groups[$group_id];
        }

        $group = Database::from('storage_groups');
        $group->whereAnd('group_id', '=', $group_id);

        $group = $group->get();

        if (!is_array($group) || count($group) != 1) {
            return $groups[$group_id] = false;
        }

        return $groups[$group_id] = $group[0]->group_name;
    }

    protected static function __makeLinkAddress() {
        $link  = isSecureConnection() ? 'https' : 'http';
        $link .= '://' . Config::get('storage.domain');

        $port = 80;

        if (isset($_SERVER['SERVER_PORT']) && preg_match('#^\d{1,5}$#', $_SERVER['SERVER_PORT'])) {
            $port = (int)$_SERVER['SERVER_PORT'];
        }

        if (isset($_SERVER['HTTP_HOST']) && preg_match('#:(\d{1,5})$#', $_SERVER['HTTP_HOST'], $data)) {
            $port = (int)$data[1];
        }

        if ($port != 80) {
            $link .= ':' . $port;
        }

        return $link;
    }
}