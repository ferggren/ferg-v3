<?php
class Portfolio_Controller extends BaseController {
    public function actionIndex() {
        $view = new Template('site.portfolio.list');
        $view->assign('current_menu', 'portfolio');
        $view->printView();
    }
}