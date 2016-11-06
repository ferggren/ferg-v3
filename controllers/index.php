<?php
class Index_Controller extends BaseController {
  public function actionIndex() {
    header('Location: /'.Lang::getLang().'/');
    exit;
    // $view = new Template('site');
    // $view->printView();
  }
}
?>