<?php
class StoragePreview {
    /**
     *  Checks if preview is available for the file
     *
     *  @param {string} file_name File name
     *  @param {string} file_path File path
     *  @return {boolean} Preview availability
     */
    public static function checkPreviewFeature($file_name, $file_path) {
        if (StorageFiles::getFileMedia($file_name) != 'image') {
            return false;
        }

        $ext = StorageFiles::getFileExt($file_name);

        if (!in_array($ext, array('jpg', 'jpeg', 'png', 'gif'))) {
            return false;
        }

        if (!($img = self::__createImage($file_path))) {
            return false;
        }

        imageDestroy($img);

        return true;
    }

    /**
     *  Makes signed preview link
     *
     *  @param {object} file File db entry
     *  @param {array} preview_options List of preview options
     *  @return {string} Signed preview link
     */
    public static function makePreviewLink($file, $preview_options) {

    }

    /**
     *  Check if preview sign is correct
     *
     *  @param {object} file File db entry
     *  @param {array} preview_options List of preview options
     *  @param {string} preview_sign Preview sign
     *  @return {boolean} Preview check status
     */
    public static function checkPreviewSign($file, $preview_options, $preview_sign) {

    }

    /**
     *  Makes preview file with specified options
     *
     *  @param {object} file File db entry
     *  @param {array} preview_options List of preview options
     *  @return {string} Preview path
     */
    public static function makePreview($file, $preview_options) {

    }

    /**
     *  Validates preview options
     *
     *  @param {array} preview_options List of preview options
     *  @return {array} Validated preview options
     */
    protected static function __validatePreviewOptions($preview_options) {
        $validated = $preview_options;

        return $validated;
    }

    /**
     *  Creates image
     *
     *  @param {string} img_path File path
     *  @param {boolean} convert2true_color convert image to true color
     *  @return {object} Image resource (or false)
     */
    protected static function __createImage($img_path, $convert2true_color = false) {
        $config = Config::get('storage.image_preview');

        if (!file_exists($img_path)) {
            return false;
        }

        if (filesize($img_path) >= $config['max_filesize']) {
            return false;
        }

        if (!($info = getimagesize($img_path))) {
            return false;
        }

        $w = $info[0];
        $h = $info[1];
        $type = $info[2];

        if ($w >= $config['max_filewidth']) return false;
        if ($w <= $config['min_filewidth']) return false;
        if ($h >= $config['max_fileheight']) return false;
        if ($h <= $config['min_fileheight']) return false;

        $img = false;
        switch($type) {
            case 1: {
                $img = imagecreatefromgif($img_path);
                break;
            }
            
            case 2: {
                $img = imagecreatefromjpeg($img_path);
                break;
            }
            
            case 3: {
                $img = imagecreatefrompng($img_path);
                break;
            }
        }

        if(!$img) return false;

        $w = imagesx($img);
        $y = imagesy($img);

        if ($w >= $config['max_filewidth']) return false;
        if ($w <= $config['min_filewidth']) return false;
        if ($h >= $config['max_fileheight']) return false;
        if ($h <= $config['min_fileheight']) return false;

        if ($convert2true_color && !imageIsTrueColor($img)) {
            $tmp = $img;
            
            $img = imagecreatetruecolor($w, $h);
            imagesavealpha($img, true);
            imageCopyResampled($img, $tmp, 0, 0, 0, 0, $w, $h, $w, $h);
            imageDestroy($tmp);
        }

        return $img;
    }
}
?>