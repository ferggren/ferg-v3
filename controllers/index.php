<?php
class Index_Controller extends BaseController {
    public function actionIndex() {
        $view = new Template('site.landing');
        $view->printView();
    }
}