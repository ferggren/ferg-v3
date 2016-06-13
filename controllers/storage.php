<?php
class Storage_Controller extends BaseController {
    /**
     *  Show storage interface
     */
    public function actionIndex() {
        $view = new Template('site.storage');
        $view->assign('current_menu', 'storage');
        $view->printView();
    }

    /**
     *  File download
     */
    public function actionDownload($file_hash) {
        // check file
        if (!($file = self::__getFile($file_hash))) {
            return self::__errorRedirect();
        }

        if (!$file->userHasAccess()) {
            return self::__errorRedirect();
        }

        if (!file_exists(ROOT_PATH . $file->file_path)) {
            return self::__errorRedirect();
        }

        // if modified - ok
        if (isset($_SERVER['HTTP_IF_MODIFIED_SINCE']) && $_SERVER['HTTP_IF_MODIFIED_SINCE']) {
            self::enableHTTPCaching();
            header("HTTP/1.0 304 Not Modified");
            exit;
        }

        // downloads
        $file->updateDownloads();

        // file info
        $filename = htmlspecialchars_decode(str_replace(
            array("\n", "\t", "\r", "'", '"'),
            array('', '', '', '', ''),
            $file->file_name
        ));

        $ext = StorageFiles::getFileExt($filename);
        $content_type = 'application/' . ($ext ? $ext : 'plain');

        if ($file->file_media == 'image' && in_array($ext, array('jpg', 'jpeg', 'png', 'gif', 'bmp'))) {
            $content_type = 'image/' . $ext;
        }

        if ($file->file_media == 'source') {
            $content_type = 'text/' . ($ext ? $ext : 'plain');
        }

        self::enableHTTPCaching();

        // file redirect
        header('Content-type: ' . $content_type);
        header('Content-Length: ' . filesize(ROOT_PATH . $file->file_path));
        header('Content-Disposition: filename="' . $filename . '"');
        header("X-Accel-Redirect: " . $file->file_path);
    }

    /**
     *  File preview
     */
    public function actionPreview($file_hash) {
        var_dump('preview');
        exit;
    }

    /**
     *  Redirect to a default action
     */
    protected static function __errorRedirect() {
        self::disableHTTPCaching();
        header('Location: /storage/');
        exit;
    }

    /**
     *  Return file info by file hash
     *
     *  @param {string} file_hash File hash
     */
    protected static function __getFile($file_hash) {
        if (!is_string($file_hash) || !preg_match('#^[0-9a-zA-Z_-]{8,10}$#', $file_hash)) {
            return false;
        }

        $file = StorageFiles::where('file_hash', '=', $file_hash);
        $file = $file->get();

        if (count($file) != 1) {
            return false;
        }

        $file = $file[0];

        if ($file->file_deleted) {
            return false;
        }

        return $file;
    }

    /**
     *  Disable default headers
     */
    protected static function sendDefaultHeaders() {
        return;
    }

    /**
     *  Disable browser caching
     */
    protected static function disableHTTPCaching() {
        disableBrowserCaching();
    }

    /**
     *  Enable browser caching
     */
    protected static function enableHTTPCaching() {
        header('ETag: ""');
        header('Last-Modified: '.gmdate('D, d M Y H:i:s', time()) . ' GMT');
        header('Expires: '.gmdate('D, d M Y H:i:s', time() + (60 * 60 * 24 * 7)) . ' GMT');
        header('Cache-Control: max-age=259200');
    }
}