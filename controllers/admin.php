<?php
class Admin_Controller extends BaseController {
  public static $user_auth = true;
  public static $user_access_level = 'admin';
  
  public function actionIndex() {
    $view = new Template('admin');
    $view->printView();
  }
}
?>