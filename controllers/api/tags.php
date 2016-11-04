<?php
class ApiTags_Controller extends ApiController {
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

    $ret       = array();
    $group2tag = array();
    $tag2group = array();

    foreach(explode(',', $groups) as $group) {
      if (!($group = trim($group))) {
        continue;
      }

      if (!($tag = $this->_getTag($group))) {
        continue;
      }

      $group2tag[$group] = $tag;
      $tag2group[$tag] = $group;
    }

    if (!count($tag2group)) {
      return $this->success();
    }

    $tags_groups = Tags::getTags(array_keys($tag2group));

    if (count($tag2group) == 1) {
      $tags_groups = array(array_keys($tag2group)[0] => $tags_groups);
    }

    foreach ($tags_groups as $tags_group => $tags) {
      $ret[$tag2group[$tags_group]] = $tags;
    }

    return $this->success($ret);
  }

  /**
   *  Translate nice name into tags group name
   *
   *  @param {string} group Tags group nice name
   *  @return {string} Tags group real name
   */
  protected function _getTag($group) {
    if ($group == 'feed') {
      return 'feed';
    }

    if (in_array($group, array('blog', 'events', 'dev'))) {
      return "pages_{$group}_visible";
    }

    if (in_array($group, array('camera', 'lens', 'category'))) {
      if (!($gallery_id = $this->_getGalleryCollectionId())) {
        return false;
      }

      return "photos_{$gallery_id}_{$group}";
    }

    return false;
  }

  /**
   *  Get gallery ID
   */
  protected function _getGalleryCollectionId() {
    static $id = false;

    if ($id !== false) {
      return $id;
    }

    $res = Database::from('photolibrary_collections');
    $res->whereAnd('collection_name', 'LIKE', 'gallery');
    $res->whereAnd('user_id', '=', 1);

    if (!count($res = $res->get())) {
      return $id = 0;
    }

    return $id = $res[0]->collection_id;
  }
}