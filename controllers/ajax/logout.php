<?php
class AjaxLogout_Controller extends AjaxController {
    /**
     *  Just logout. Thats all
     */
    public function actionIndex() {
        if (!User::isAuthenticated()) {
            return $this->jsonSuccess();
        }

        session::logout();
        return $this->jsonSuccess();
    }
}
?>