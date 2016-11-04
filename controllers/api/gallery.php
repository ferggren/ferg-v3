<?php
class ApiGallery_Controller extends ApiController {
  public function actionIndex() {
    return $this->error('access_denied');
  }

  /**
   *  Return feed tags
   *  
   *  @param {string} groups Comma-separated groups
   *  @return {object} Tags list
   */
  public function actionGetPhotos($tag) {
    if (!preg_match('#^[0-9a-zA-ZАаБбВвГгДдЕеЁёЖжЗзИиЙйКкЛлМмНнОоПпРрСсТтУуФфХхЦцЧчШшЩщЪъЫыЬьЭэЮюЯя?.,?!\s:/_-]{0,50}$#uis', $tag)) {
      return $this->error('incorrect_tag');
    }

    if (!($collection_id = $this->_getGalleryCollectionId())) {
      return $this->error('photos_not_found');
    }

    $where = array();

    if ($tag) {
      if (!($where_in = $this->_makeTagWhere($collection_id, $tag))) {
        return $this->success(array());
      }

      if (!count($where_in)) {
        return $this->success(array());
      }

      $where[] = "file_id IN (".implode(',', $where_in).")";
    }

    $where[] = "photo_collection_id = '".Database::escape($collection_id)."'";
    $where[] = "photo_deleted = 0";

    $photos = PhotoLibrary::orderBy('photo_taken_timestamp', 'desc');
    $photos = PhotoLibrary::orderBy('file_id', 'desc');
    $photos->whereRaw(implode(' AND ', $where));

    if (!($count = $photos->count())) {
      return $this->success(array());
    }

    $ret = array();

    foreach ($photos->get() as $photo) {
      $ret[] = $photo->export();
    }

    return $this->success($ret);
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

  /**
   *  Return photos by tag
   *
   *  @param {int} collection_id Collection ID
   *  @param {string} tag Tag
   *  @return {object} Photo IDs
   */
  protected function _makeTagWhere($collection_id, $tag) {
    if (!$tag) return array();

    $key = "photos_{$collection_id}_";

    $groups = array(
      "camera",
      "lens",
      "category",
    );

    $uniq = array();

    foreach ($groups as $group) {
      if (!count($photos = Tags::getTagRelations($key.$group, $tag))) {
        continue;
      }

      foreach ($photos as $photo) {
        $uniq[$photo] = true;
      }
    }

    return array_keys($uniq);
  }
}