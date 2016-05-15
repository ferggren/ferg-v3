<?php
class Storage_Controller extends BaseController {
    public function actionIndex() {
        $view = new Template('site.storage');
        $view->assign('current_menu', 'storage');
        $view->printView();
    }
}