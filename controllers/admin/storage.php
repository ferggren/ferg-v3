<?php
class AdminStorage_Controller extends BaseController {
    public static $user_auth = true;
    public static $user_access_level = 'admin';
    
    public function actionIndex() {
        $view = new Template('admin.admin');
        $view->printView();
        return;
        $view = new Template('admin.storage');
        $view->assign('current_menu', 'storage');
        $view->printView();
    }
}
?>