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

  /**
   *  Create new page
   *
   *  @param {string} type Page type
   *  @return {object} Created page
   */
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

    $page = new MediaPages;
    $page->page_type = $type;
    $page->save();

    return $this->jsonSuccess($page->export());
  }

  /**
   *  Get pages
   *
   *  @param {int} page Page number
   *  @param {string} type Page type
   *  @param {string} visible Visible flag
   *  @param {string} tag Search pages by tag
   *  @return {object} Found pages
   */
  public function actionGetPages($page, $type, $visible = 'visible', $tag) {
    $ret = array(
      'page'  => 1,
      'pages' => 1,
      'list'  => array(),
    );

    if (!in_array($type, self::$_types)) {
      return $this->jsonSuccess($ret);
    }

    $visible = $this->_checkVisibility($visible);

    $where = array();

    if ($tag) {
      if (!($pages = $this->_getTagPages($type, $visible, $tag))) {
        return $this->jsonSuccess($ret);
      }

      if (!count($pages)) {
        return $this->jsonSuccess($ret);
      }

      $where[] = 'page_id IN (' . implode($pages) . ')';
    }

    $where[] = "page_type = '" . Database::escape($type) . "'";

    if ($visible != 'all') {
      $where[] = 'page_visible = ' . (($visible == 'visible') ? '0' : '1');
    }

    $where[] = "page_deleted = 0";

    $pages = MediaPages::whereRaw($where = implode(' AND ', $where));
    $pages->orderBy('page_date_timestamp', 'DESC');
    $pages->orderBy('page_id', 'DESC');

    if (!($count = $pages->count())) {
      return $this->jsonSuccess($ret);
    }

    $rpp = 10;
    $ret['page'] = is_numeric($page) ? (int)$page : 1;
    $ret['pages'] = (int)($count / $rpp);
    if (($ret['pages'] * $rpp) < $count) ++$ret['pages'];
    if ($ret['page'] > $ret['pages']) $ret['page'] = $ret['pages'];

    $pages->limit(
      $rpp,
      (($ret['page'] - 1) * $rpp)
    );

    foreach ($pages->get() as $page) {
      $ret['list'][] = $page->export();
    }

    return $this->jsonSuccess($ret);
  }

  /**
   *  Restore page
   *  @param {int} id Page id
   *  @return {boolean} Status
   */
  public function actionRestorePage($id) {
    return $this->_changePageFlag($id, "deleted", 0);
  }

  /**
   *  Restore page
   *  @param {int} id Page id
   *  @return {boolean} Status
   */
  public function actionDeletePage($id) {
    return $this->_changePageFlag($id, "deleted", 1);
  }

  /**
   *  Restore page
   *  @param {int} id Page id
   *  @return {boolean} Status
   */
  public function actionHidePage($id) {
    return $this->_changePageFlag($id, "visible", 0);
  }

  /**
   *  Restore page
   *  @param {int} id Page id
   *  @return {boolean} Status
   */
  public function actionShowPage($id) {
    return $this->_changePageFlag($id, "visible", 1);
  }

  /**
   *  Return page info
   *
   *  @param {int} id Page id
   *  @return {object} Page info
   */
  public function actionGetPage($id) {
    if (!preg_match('#^\d++$#', $id)) {
      return $this->jsonError('incorrect_page_id');
    }

    if (!($page = MediaPages::find($id))) {
      return $this->jsonError('incorrect_page_id');
    }

    if ($page->page_deleted) {
      return $this->jsonError('incorrect_page_id');
    }

    if (!$page->page_visible) {
      if (!User::isAuthenticated()) {
        return $this->jsonError('incorrect_page_id');
      }

      if (!User::hasAccess('admin')) {
        return $this->jsonError('incorrect_page_id');
      }
    }

    return $this->jsonSuccess($page->export());
  }

  /**
   *  Return tags assigned to page type
   *
   *  @param {string} type Pages type
   *  @param {string} visible Visibility type
   *  @return {object} Tags list
   */
  public function actionGetTags($type, $visible = 'visible') {
    if (!in_array($type, self::$_types)) {
      return $this->jsonError('incorrect_type');
    }

    $visible = $this->_checkVisibility($visible);

    return $this->jsonSuccess(Tags::getTagValues(
      "pages_{$type}_{$visible}"
    ));
  }

  /**
   *  Check if user has access to $visible
   *
   *  @param {string} visible Visibility type
   *  @return {string} Visibility type allowed for user
   */
  protected function _checkVisibility($visible) {
    if (!User::isAuthenticated()) {
      return 'visible';
    }

    if (!User::hasAccess('admin')) {
      return 'visible';
    }

    if (!in_array($visible, array('all', 'visible', 'hidden'))) {
      return 'visible';
    }

    return $visible;
  }

  /**
   *  Return pages by tag
   *
   *  @param {string} type Pages type
   *  @param {string} visible Visibility type
   *  @param {string} tag Tag
   *  @return {object} Pages id's
   */
  protected function _getTagPages($type, $visible, $tag) {
    $key = "pages_{$type}_{$visible}";

    if (!preg_match('#^[0-9a-zA-ZАаБбВвГгДдЕеЁёЖжЗзИиЙйКкЛлМмНнОоПпРрСсТтУуФфХхЦцЧчШшЩщЪъЫыЬьЭэЮюЯя?.,?!\s:/_-]{1,50}$#ui', $tag)) {
      return false;
    }

    return Tags::getTagTargets($key, $tag);
  }

  /**
   *  Change page field
   *
   *  @param {int} id Page id
   *  @param {string} field Page field
   *  @param {int} value Page field value
   *  @param {boolean} Status
   */
  protected function _changePageFlag($id, $field, $value) {
    if (!User::isAuthenticated()) {
      return $this->jsonError('access_denied');
    }

    if (!User::hasAccess('admin')) {
      return $this->jsonError('access_denied');
    }

    if (!preg_match('#^\d++$#', $id)) {
      return $this->jsonError('incorrect_page_id');
    }

    if (!($page = MediaPages::find($id))) {
      return $this->jsonError('incorrect_page_id');
    }

    if (!in_array($field, array('deleted', 'visible'))) {
      return $this->jsonError('incorrect_field');
    }

    $field = 'page_' . $field;
    $value = $value ? '1' : '0';

    if ($page->$field == $value) {
      return $this->jsonSuccess();
    }

    $page->$field = $value;
    $page->save();

    return $this->jsonSuccess();
  }
}
?>