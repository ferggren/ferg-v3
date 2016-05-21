<?php
class AjaxStorage_Controller extends AjaxController {
    public function actionIndex($admin_mode, $media) {
        $stats = array();

        return $this->jsonSuccess($stats);
    }
}