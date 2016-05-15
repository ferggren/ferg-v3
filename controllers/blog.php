<?php
class Blog_Controller extends BaseController {
    public function actionIndex() {
        $view = new Template('site.blog.list');
        $view->assign('current_menu', 'blog');
        $view->printView();
    }
}