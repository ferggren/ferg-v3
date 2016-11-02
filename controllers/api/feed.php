<?php
class ApiFeed_Controller extends ApiController {
  public function actionIndex() {
    return $this->error('access_denied');
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