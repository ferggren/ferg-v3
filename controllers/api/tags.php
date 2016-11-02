<?php
class ApiTags_Controller extends ApiController {
  static $map = array(
    'feed' => 'feed',
  );

  public function actionIndex() {
    return $this->error('access_denied');
  }

  /**
   *  Return feed tags
   *  
   *  @param {string} groups Comma-separated groups
   *  @return {object} Tags list
   */
  public function actionGetTags($groups) {
    if (!preg_match('#^[0-9a-zA-Z_,.-]++$#uis', $groups)) {
      return $this->error('incorrect_tag_group');
    }

    $ret = array();

    foreach(explode(',', $groups) as $group) {
      if (!($group = trim($group))) {
        continue;
      }

      $ret[] = $group;
    }

    if (!count($ret)) {
      return $this->success();
    }

    $tags = Tags::getTags($ret);

    return $this->success(
      count($ret) == 1 ? array($ret[0] => $tags) : $tags
    );
  }

  /**
   *  Return feed
   *  
   *  @param {int} page Page offset
   *  @param {string} tag Search by tag
   *  @return {object} Feed
   */
  public function actionGetFeed($page = 1, $tag = '') {
    $ret = array(
      'page'  => 1,
      'pages' => 1,
      'list'  => array()
    );

    return $this->success($ret);
  }
}