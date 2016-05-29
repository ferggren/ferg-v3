<?php
class Storage {
    public static function getFileExt($file_name) {
        $file_name = strtolower($file_name);

        if (!preg_match('#\.([0-9a-z_-]{1,6})$#', $file_name, $data)) {
            return '';
        }

        return strtolower($data[1]);
    }

    public static function checkPreviewFeature($upload) {
        if ($upload['media'] != 'image') {
            return false;
        }

        $ext = self::getFileExt($upload['name']);

        if (!in_array($ext, array('jpg', 'jpeg', 'png', 'gif'))) {
            return false;
        }

        if (!($img = self::__createImage($upload['tmp_path']))) {
            return false;
        }

        imageDestroy($img);

        return true;
    }

    public static function getFileMedia($file_name) {
        if (!($ext = self::getFileExt($file_name))) {
            return 'other';
        }

        if (!preg_match('#\.([0-9a-z_-]{1,6})$#', $file_name, $data)) {
            return 'other';
        }

        $ext = strtolower($data[1]);

        $media_groups = array(
            'image' => array(
                'gif', 'png', 'jpg', 'jpeg', 'psd', 'bmp', 'tiff',
                'dng', 'raw',
            ),

            'video' => array(
                'flv', 'mkv', 'webm', 'vob', 'ogv', 'mov', 'qt', 'avi',
                'mp4', 'm4p', 'm4v', 'mpg', 'mp2', 'mpeg', 'mpe', 'mpv',
                'mpeg', 'm2v', '3gp',
            ),

            'audio' => array(
                'aac', 'aiff', 'amr', 'aa', 'aax', 'act', 'ape',
                'au', 'dvf', 'flac', 'm4a', 'mmf', 'mp3', 'mpc',
                'msf', 'ogg', 'oga', 'ra', 'rm', 'wav', 'wma',
                'aif', 'mid',
            ),

            'document' => array(
                'doc', 'docx', 'msg', 'odt', 'rtf', 'tex', 'txt',
                'wpd', 'wps', 'pps', 'ppt', 'pptx', 'ai', 'sdg',
                'pdf', 'indd', 'xlr', 'xls', 'xlsx', 'txt', 'dwg',
                'dxf',
            ),

            'source' => array(
                'htm', 'html', 'xml', 'sql', 'js', 'jsp', 'c',
                'class', 'cpp', 'cs', 'h', 'java', 'lua', 'm',
                'pl', 'py', 'sh', 'sln', 'swift', 'vb', 'src',
                'cfg', 'perl', 'r', 'rb', 's', 'asm', 'asp',
                'css', 'scss', 'sass', 'inc', 'ini', 'json',
                'c++', 'cmake', 'rake', 'pyt', 'rbw', 'scala',
                'php',
            ),

            'archive' => array(
                'iso', 'tar', 'bz2', 'gz', '7z', 's7z', 'apk', 'arc',
                'cab', 'dmg', 'rar', 'sfx', 'zip', 'zipx', 'rpm',
                'pkg', 'deb', 
            ),
        );

        foreach ($media_groups as $group => $extensions) {
            if (in_array($ext, $extensions)) {
                return $group;
            }
        }

        return 'other';
    }

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