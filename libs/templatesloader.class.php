<?php
class TemplatesLoader {
    protected static $cache = false;

    public static function printView($view, $args) {
        $info = self::getTemplate($view);

        if(!$info) {
            return false;
        }

        self::prepareTemplate($view);

        $class = new $info['class']($args);
        $class->section___main();
    }

    public static function exists($view) {
        $list = self::getTemplates();
        return isset($list[self::prepareView($view)]);
    }

    protected static function getTemplate($view) {
        $view = self::prepareView($view);
        $list = self::getTemplates();

        return isset($list[$view]) ? $list[$view] : false;
    }

    protected static function prepareView($view) {
        $view = strtolower($view);
        return $view;
    }

    protected static function getTemplates() {
        if (is_array(self::$cache)) {
            return self::$cache;
        }

        if (is_array(self::$cache = self::loadFromFileCache())) {
            return self::$cache;
        }

        if (!is_array(self::$cache = TemplatesParser::parse())) {
            trigger_error('error while making templates list');
            exit;
        }

        self::saveToFileCache(self::$cache);

        return self::$cache;
    }

    protected static function loadFromFileCache() {
        if (!Config::get('app.cache_templates')) {
            return false;
        }

        if (!file_exists($tmp_path = ROOT_PATH . '/tmp/templates.php')) {
            return false;
        }

        include $tmp_path;

        if (!isset($cache)) {
            return false;
        }

        return $cache;
    }

    protected static function saveToFileCache($list) {
        if (!Config::get('app.cache_templates')) {
            return false;
        }

        $code = self::variable2code($list);

        if (!($file = fopen(ROOT_PATH . '/tmp/templates.php.tmp', 'wb'))) {
            return false;
        }

        fwrite($file, '<?php $cache = ' . $code . '; ?>');
        fclose($file);

        rename(
            ROOT_PATH . '/tmp/templates.php.tmp',
            ROOT_PATH . '/tmp/templates.php'
        );

        return true;
    }

    /**
    * Loads view's class and all classes in parent tree
    */
    protected static function prepareTemplate($view) {
        $list = self::getTemplates();
        $include = array(
            array($list[$view]['class'], $list[$view]['cache_path']),
        );

        $parent = $list[$view]['parent'];

        while ($parent) {
            $include[] = array($list[$parent]['class'], $list[$parent]['cache_path']);
            $parent = $list[$parent]['parent'];
        }

        $include = array_reverse($include);

        foreach ($include as $class) {
            if (class_exists($class[0], false)) {
                continue;
            }

            include ROOT_PATH . $class[1];
        }
    }

    /**
    * Translates variable into text variable declaration 
    */
    protected static function variable2code($var) {
        $type = gettype($var);

        switch ($type) {
            case 'boolean': {
                return $var ? 'true' : 'false';
            }

            case 'integer': {
                return $var;
            }

            case 'double': {
                return $var;
            }

            case 'string': {
                return "'" . str_replace(array("\\", "'"), array("\\\\", "\\'"), $var) . "'";
            }

            case 'array': {
                $array = array();

                foreach ($var as $key => $value) {
                    $array[] = self::variable2code($key) . '=>' . self::variable2code($value);
                }

                return 'array(' . implode(',', $array) . ')';
            }

            default: {
                return 'NULL';
            }
        }

        return 'NULL';
    }
}
?>