<?php
class MediaPages extends Database {
    protected static $table = 'media_pages';
    protected static $primary_key = 'page_id';
    protected static $timestamps = true;
    
    /**
     *  Search for pages
     *
     *  @param {array} options Filters list
     *                         group - pages group
     *                         tag - tagged pages
     *                         lang - page lang (default = all)
     *                         page - number of page
     *                         visible - page visible status (default = visible)
     *  @return {array} Pages
     */
    public static function search($options) {
        if (!($options = self::__validateSearchOptions($options))) {
            return array();
        }

        $res = Database::from('media_pages p');
        $res->whereAnd('p.page_group', '=', $options['group']);
        $res->whereAnd('p.page_deleted', '=', '0');

        if ($options['visible'] != 'all') {
            $query->whereAnd('p.page_visible', '=', $options['visible'] == 'visible');
        }

        $rpp = Config::get('pages.results_per_page');
        $count = $res->count();
        $pages = (int)($count / $rpp);
        if (($pages * $rpp) < $count) ++$pages;

        $pages = max($pages, 1);
        $page = min($pages, $options['page']);

        $res->orderBy('p.page_date', 'DESC');
        $res->limit($rpp, ($page - 1) * $rpp);
        $res = $res->get();

        $ret = array();

        foreach ($res as $row) {
            $info = array(
                'id' => (int)$row->page_id,
                'group' => $row->page_group,
                'date' => $row->page_date,
                'url' => $row->page_url,
                'preview' => $row->page_preview,
                'versions' => array(),
                'visible' => !!$row->page_visible,
            );

            if ($row->page_versions) {
                $info['versions'] = explode(',', $row->page_versions);
            }

            $ret[] = $info;
        }

        return array(
            'page' => $page,
            'pages' => $pages,
            'count' => $count,
            'list' => $ret,
        );
    }

    /**
     *  Validate filter options
     *
     *  @param {array} options Options to validate
     *  @return {array} Validated options
     */
    protected static function __validateSearchOptions($options) {
        if (!is_array($options)) return false;

        if (!isset($options['group'])) {
            return false;;
        }

        if (!($group = MediaPagesGroups::find($options['group']))) {
            return false;
        }

        if (!isset($options['page']) || !is_numeric($options['page'])) {
            $options['page'] = 1;
        }
        $options['page'] = (int)$options['page'];
        $options['page'] = min(100, $options['page']);
        $options['page'] = max(1, $options['page']);

        if (
            !isset($options['visible'])
            || !in_array($options['visible'], array('all', 'visible', 'hidden'))) {
            $options['visible'] = 'visible';
        }

        if (!isset($options['tag']) || !is_string($options['tag'])) {
            $options['tag'] = false;
        }

        if ($options['tag'] && !$group->tags_enabled) {
            $options['tag'] = false;
        }

        if (!isset($options['lang']) || !in_array($options['lang'], Lang::getLangs())) {
            $options['lang'] = 'all';
        }

        return $options;
    }
}