<?php
class Gallery_Controller extends BaseController {
    public function actionIndex() {
        $view = new Template('site.gallery.list');
        $view->assign('current_menu', 'gallery');
        $view->printView();
    }
}