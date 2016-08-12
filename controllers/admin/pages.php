<?php
class AdminPages_Controller extends BaseController {
    public static $user_auth = true;
    public static $user_access_level = 'admin';

    /**
     *  Show pages list
     *
     *  @param {string} pages_group Pages group
     *  @param {number} page_id If set, page action will be called instead
     *  @param {number} page Number of page
     *  @param {string} tag If set, only tagged pages will be shown
     */
    public function actionIndex($pages_group, $page_id, $page, $tag) {
        if ($page_id) {
            return $this->actionPage($page_id);
        }

        if (!preg_match('#^[0-9a-zA-Z_-]{1,20}$#', $pages_group)) {
            header('Location: /'.Lang::getLang().'/admin/');
            exit;
        }

        if (!($group = MediaPagesGroups::find($pages_group))) {
            header('Location: /'.Lang::getLang().'/admin/');
            exit;
        }

        if (!is_numeric($page)) $page = 1;
        $page = (int)$page;

        $list = MediaPages::search(
            array(
                'visible' => 'all',
                'group' => $pages_group,
                'page' => $page,
                'tag' => $tag,
                'lang' => 'all',
            ),
            array(
                'width' => 900,
                'height' => 150,
                'crop' => true,
                'valign' => 'top',
                'align' => 'center',
            )
        );

        if (!$list) {
            header('Location: /'.Lang::getLang().'/admin/');
            exit;
        }

        $view = new Template('admin.pages.list');

        $view->assign('current_menu', $pages_group);
        $view->assign('pages_list', $list['list']);
        $view->assign('pages_group', $pages_group);
        $view->assign('group_tags', !!$group->tags_enabled);

        // paginator
        $link = '/' . Lang::getLang() . '/admin/pages/' . $pages_group . '/?';
        if ($tag) {
            $link .= 'tag=' . base64_encode($tag) . '&';
        }
        $link .= '&page=%page%';

        $view->assign('paginator_page', $list['page']);
        $view->assign('paginator_pages', $list['pages']);
        $view->assign('paginator_link', $link);

        $view->printView();
    }

    /**
     *  Show page editor
     *
     *  @param {number} page_id Page id
     */
    public function actionPage($page_id) {
        if (!preg_match('#^\d++$#', $page_id)) {
            header('Location: /'.Lang::getLang().'/admin/');
            exit;
        }

        if (!($page = MediaPages::find($page_id))) {
            header('Location: /'.Lang::getLang().'/admin/');
            exit;
        }

        if ($page->page_deleted) {
            header('Location: /'.Lang::getLang().'/admin/');
            exit;
        }

        $view = new Template('admin.pages.page');

        $view->assign('current_menu', $page->page_group);
        $view->assign('page_group', $page->page_group);
        $view->assign('page_id', (int)$page->page_id);

        $view->printView();
    }
}