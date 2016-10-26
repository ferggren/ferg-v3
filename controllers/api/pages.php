<?php
class ApiPages_Controller extends AjaxController {
  static $_types = array(
    "portfolio",
    "moments",
    "notes",
  );
  /**
   *  Access error
   */
  public function actionIndex() {
    return $this->jsonError('access_denied');
  }

  public function actionCreatePage($type) {
    if (!User::isAuthenticated()) {
      return $this->jsonError('access_denied');
    }

    if (!User::hasAccess('admin')) {
      return $this->jsonError('access_denied');
    }

    if (!in_array($type, self::$_types)) {
      return $this->jsonError('access_denied');
    }

    return $this->jsonError($type);
  }

  public function actionGetPages($page, $type, $visible, $tag) {
    $ret = array(
      'page'  => 1,
      'pages' => 1,
      'list'  => array(),
    );

    if (!in_array($type, self::$_types)) {
      return $this->jsonSuccess($ret);
    }

    $visible = $this->_checkVisibility($visible);

    return $this->jsonSuccess($ret);
  }

  public function actionGetTags($type, $visible) {
    if (!in_array($type, self::$_types)) {
      return $this->jsonError('incorrect_type');
    }

    $key = "";

    if ($this->_checkVisibility($visible) == "all") {
      $key = "pages_{$type}_all";
    }
    else {
      $key = "pages_{$type}_visible";
    }

    return $this->jsonSuccess(Tags::getTagValues($key));
  }

  /**
   *  Check user access
   */
  protected function _checkVisibility($visible) {
    if (!User::isAuthenticated()) {
      return 'visible';
    }

    if (!User::hasAccess('admin')) {
      return 'visible';
    }

    return $visible == 'all' ? 'all' : 'visible';
  }
}
?>