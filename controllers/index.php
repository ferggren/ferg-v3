<?php
class Index_Controller extends BaseController {
  public function actionIndex() {
    header('Location: /');
    exit;
    // $view = new Template('site');
    // $view->printView();
  }
}
?>