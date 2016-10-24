<?php
class ApiPhotoLibrary_Controller extends AjaxController {
  public static $user_auth = true;
  public static $user_access_level = 'admin';

  /**
   *  Access error
   */
  public function actionIndex() {
    return $this->jsonError('access_denied');
  }

  /**
   *  Return tags by category
   *
   *  @param {int} collection Category id
   *  @return {object} Tags list
   */
  public function actionGetTags($collection = 0) {
    if (!$this->_checkCollectionId($collection)) {
      return $this->jsonError('invalid_collection_id');
    }

    $key = "photos_{$collection}_";

    $tags = Tags::getTagValues(array(
      "{$key}iso",
      "{$key}shutter_speed",
      "{$key}aperture",
      "{$key}camera",
      "{$key}lens",
      "{$key}category",
    ));

    return $this->jsonSuccess(array(
      "iso"           => $tags["{$key}iso"],
      "shutter_speed" => $tags["{$key}shutter_speed"],
      "aperture"      => $tags["{$key}aperture"],
      "camera"        => $tags["{$key}camera"],
      "lens"          => $tags["{$key}lens"],
      "category"      => $tags["{$key}category"],
    ));
  }

  /**
   *  Delete photo
   *
   *  @param {int} page Page id
   *  @param {string} tags List of comma-seperated tags
   *  @param {int} collection Collection id
   *  @return {object} Photos
   */
  public function actionDeletePhoto($photo_id = 0) {
    if (!is_string($photo_id) || !preg_match('#^\d{1,10}$#', $photo_id)) {
      return $this->jsonError('invalid_photo_id');
    }

    if (!$photo = PhotoLibrary::find($photo_id)) {
      return $this->jsonError('invalid_photo_id');
    }

    if ($photo->user_id != User::get_user_id()) {
      if (!User::hasAccess('admin')) {
        return $this->jsonError('invalid_photo_id');
      }
    }

    if ($photo->photo_deleted) {
      return $this->jsonSuccess();
    }

    $photo->photo_deleted = 1;
    $photo->save();

    if ($photo->photo_collection_id) {
      if ($collection = $this->_updateCollection($photo->photo_collection_id)) {
        return $this->jsonSuccess(array(
          'collection' => $collection,
        ));
      }
    }

    return $this->jsonSuccess();
  }

  /**
   *  Restore photo
   *
   *  @param {int} page Page id
   *  @param {string} tags List of comma-seperated tags
   *  @param {int} collection Collection id
   *  @return {object} Photos
   */
  public function actionRestorePhoto($photo_id = 0) {
    if (!is_string($photo_id) || !preg_match('#^\d{1,10}$#', $photo_id)) {
      return $this->jsonError('invalid_photo_id');
    }

    if (!$photo = PhotoLibrary::find($photo_id)) {
      return $this->jsonError('invalid_photo_id');
    }

    if ($photo->user_id != User::get_user_id()) {
      if (!User::hasAccess('admin')) {
        return $this->jsonError('invalid_photo_id');
      }
    }

    if (!$photo->photo_deleted) {
      return $this->jsonSuccess();
    }

    $photo->photo_deleted = 0;
    $photo->save();

    if ($photo->photo_collection_id) {
      if ($collection = $this->_updateCollection($photo->photo_collection_id)) {
        return $this->jsonSuccess(array(
          'collection' => $collection,
        ));
      }
    }

    return $this->jsonSuccess();
  }

  /**
   *  Return user photos
   *
   *  @param {int} page Page id
   *  @param {string} tags List of comma-seperated tags
   *  @param {int} collection Collection id
   *  @return {object} Photos
   */
  public function actionGetPhotos($page = 1, $tags = '', $collection = 0) {
    $ret = array(
      'page'   => 1,
      'pages'  => 1,
      'photos' => array(),
    );

    if (!$this->_checkCollectionId($collection)) {
      return $this->jsonError('invalid_collection_id');
    }

    $photos = PhotoLibrary::where('user_id', '=', User::get_user_id());
    $photos->whereAnd('photo_deleted', '=', 0);
    $photos->orderBy('file_id', 'desc');

    if ($collection) {
      $photos->whereAnd('photo_collection_id', '=', $collection);
    }

    if (!($count = $photos->count())) {
      return $this->jsonSuccess($ret);
    }

    $rpp = 24;
    $ret['page'] = is_numeric($page) ? (int)$page : 1;
    $ret['pages'] = (int)($count / $rpp);
    if (($ret['pages'] * $rpp) < $count) ++$ret['pages'];
    if ($ret['page'] > $ret['pages']) $ret['page'] = $ret['pages'];

    $photos->limit(
      $rpp,
      (($ret['page'] - 1) * $rpp)
    );

    foreach ($photos->get() as $photo) {
      $preview = StoragePreview::makePreviewLink(
        $photo->file_hash,array(
          'crop'   => true,
          'width'  => 200,
          'height' => 150,
          'align'  => 'center',
          'valign' => 'middle',
      ));

      $ret['photos'][] = array(
        'id'            => (int)$photo->file_id,
        'gps'           => $photo->photo_gps,
        'taken'         => $photo->photo_taken,
        'title_ru'      => $photo->photo_title_ru,
        'title_en'      => $photo->photo_title_en,
        'preview'       => $preview,
        'collection_id' => (int)$photo->photo_collection_id,
        'added'         => $photo->photo_added,
        'tags'          => array(
          'iso' => '',
          'shutter_speed' => '',
          'aperture' => '',
          'lens' => '',
          'camera' => '',
          'category' => '',
        ),
      );
    }

    return $this->jsonSuccess($ret);
  }

  /**
   *  Return user photo collections (with statistics)
   *
   *  @return {object} Collection
   */
  public function actionGetCollections() {
    $ret = array();

    $collections = PhotoLibraryCollections::whereAnd('user_id', '=', User::get_user_id());
    $collections->whereAnd('collection_deleted', '=', 0);

    foreach ($collections->get() as $collection) {
      $preview = false;

      if ($collection->collection_cover_photo_hash) {
        $preview = StoragePreview::makePreviewLink(
          $collection->collection_cover_photo_hash, array(
            'crop'   => true,
            'width'  => 200,
            'height' => 150,
            'align'  => 'center',
            'valign' => 'top',
        ));
      }

      $ret[] = array(
        'id'      => $collection->collection_id,
        'name'    => $collection->collection_name,
        'updated' => $collection->collection_updated,
        'cover'   => $preview,
        'photos'  => $collection->collection_photos,
      );
    }

    return $this->jsonSuccess($ret);
  }

  /**
   *  Create new photo collection
   *
   *  @param {string} collection Collection name
   *  @return {object} Collection object
   */
  public function actionCreateCollection($name = '') {
    if (!is_string($name)) {
      return $this->jsonError('invalid_collection_name');
    }

    if (iconv_strlen($name) < 1 || iconv_strlen($name) > 20) {
      return $this->jsonError('invalid_collection_name');
    }

    $exists = Database::from('photolibrary_collections');
    $exists->where('user_id', '=', User::get_user_id());
    $exists->whereAnd('collection_deleted', '=', 0);
    $exists->whereAnd('collection_name', 'LIKE', $name);

    if ($exists->count()) {
      return $this->jsonError('collection_name_exists');
    }

    $collection = new PhotoLibraryCollections;
    $collection->user_id = User::get_user_id();
    $collection->collection_name = $name;
    $collection->collection_updated = time();
    $collection->collection_created = time();
    $collection->collection_cover_photo_id = 0;
    $collection->save();

    return $this->jsonSuccess(array(
      'id'      => $collection->collection_id,
      'name'    => $collection->collection_name,
      'updated' => $collection->collection_updated,
      'cover'   => '',
      'photos'  => 0,
    ));
  }

  /**
   *  Update collection title
   *
   *  @param {string} collection Collection name
   *  @param {int} id Collection id
   *  @return {object} Collection object
   */
  public function actionUpdateCollection($id = 0, $name = '') {
    if (!is_string($name)) {
      return $this->jsonError('invalid_collection_name');
    }

    if (iconv_strlen($name) < 1 || iconv_strlen($name) > 20) {
      return $this->jsonError('invalid_collection_name');
    }

    if (!is_string($id) || !preg_match('#^\d{1,10}$#', $id)) {
      return $this->jsonError('invalid_collection_id');
    }

    if (!$collection = PhotoLibraryCollections::find($id)) {
      return $this->jsonError('invalid_collection_id');
    }

    if ($collection->user_id != User::get_user_id()) {
      if (!User::hasAccess('admin')) {
        return $this->jsonError('invalid_collection_id');
      }
    }

    if ($collection->collection_deleted) {
      return $this->jsonError();
    }

    if ($collection->collection_name == $name) {
      return $this->jsonSuccess();
    }

    $exists = Database::from('photolibrary_collections');
    $exists->where('user_id', '=', User::get_user_id());
    $exists->whereAnd('collection_deleted', '=', 0);
    $exists->whereAnd('collection_name', 'LIKE', $name);

    if ($exists->count()) {
      return $this->jsonError('collection_name_exists');
    }

    $collection->collection_name = $name;
    $collection->save();

    return $this->jsonSuccess();
  }

  /**
   *  Delete collection
   *
   *  @param {int} id Collection id
   *  @return {boolean} Result
   */
  public function actionDeleteCollection($id = 0) {
    if (!is_string($id) || !preg_match('#^\d{1,10}$#', $id)) {
      return $this->jsonError('invalid_collection_id');
    }

    if (!$collection = PhotoLibraryCollections::find($id)) {
      return $this->jsonError('invalid_collection_id');
    }

    if ($collection->user_id != User::get_user_id()) {
      if (!User::hasAccess('admin')) {
        return $this->jsonError('invalid_collection_id');
      }
    }

    if ($collection->collection_deleted) {
      return $this->jsonSuccess();
    }

    $collection->collection_deleted = 1;
    $collection->save();

    return $this->jsonSuccess();
  }

  /**
   *  Restore collection
   *
   *  @param {int} id Collection id
   *  @return {boolean} Result
   */
  public function actionRestoreCollection($id = 0) {
    if (!is_string($id) || !preg_match('#^\d{1,10}$#', $id)) {
      return $this->jsonError('invalid_collection_id');
    }

    if (!$collection = PhotoLibraryCollections::find($id)) {
      return $this->jsonError('invalid_collection_id');
    }

    if ($collection->user_id != User::get_user_id()) {
      if (!User::hasAccess('admin')) {
        return $this->jsonError('invalid_collection_id');
      }
    }

    if (!$collection->collection_deleted) {
      return $this->jsonSuccess();
    }

    $collection->collection_deleted = 0;
    $collection->save();

    return $this->jsonSuccess();
  }

  /**
   *  Create new photo
   *
   *  @param {int} file_id Storage file id
   *  @param {int} collection Collection id
   *  @return {object} Photo
   */
  public function actionAddPhoto($file_id = 0, $collection = 0) {
    if (!is_string($file_id) || !preg_match('#^\d{1,10}$#', $file_id)) {
      return $this->jsonError('invalid_file_id');
    }

    if (!$file = StorageFiles::find($file_id)) {
      return $this->jsonError('invalid_file_id');
    }

    if ($file->file_deleted) {
      return $this->jsonError('invalid_file_id');
    }

    if ($file->user_id != User::get_user_id()) {
      return $this->jsonError('invalid_file_id');
    }

    if (PhotoLibrary::find($file->file_id)) {
      return $this->jsonError('invalid_file_id');
    }

    if ($file->file_media != 'image') {
      $this->_actionDeleteFile($file);
      return $this->jsonError('invalid_file');
    }

    if (!$file->file_preview) {
      $this->_actionDeleteFile($file);
      return $this->jsonError('invalid_file');
    }

    if (!file_exists(ROOT_PATH . $file->file_path)) {
      $this->_actionDeleteFile($file);
      return $this->jsonError('invalid_file');
    }

    if (!$this->_checkCollectionId($collection)) {
      return $this->jsonError('invalid_collection_id');
    }

    $info = array();

    if (!($size = getimagesize(ROOT_PATH . $file->file_path, $info))) {
      $this->_actionDeleteFile($file);
      return $this->jsonError('invalid_file');
    }

    $photo = new PhotoLibrary;
    $photo->file_id = $file_id;
    $photo->file_hash = $file->file_hash;
    $photo->user_id = User::get_user_id();
    $photo->photo_collection_id = $collection;
    $photo->photo_size = "{$size[0]}x{$size[1]}";
    $photo->photo_added = time();
    $photo->save();

    $preview = StoragePreview::makePreviewLink(
      $photo->file_hash,array(
        'crop'   => true,
        'width'  => 200,
        'height' => 150,
        'align'  => 'center',
        'valign' => 'top',
    ));

    $ret = array(
      'photo' => array(
        'id'            => (int)$photo->file_id,
        'gps'           => '',
        'taken'         => '',
        'title_ru'      => '',
        'title_en'      => '',
        'preview'       => $preview,
        'collection_id' => (int)$photo->photo_collection_id,
        'added'         => $photo->photo_added,
        'tags'          => array(
          'iso' => '',
          'shutter_speed' => '',
          'aperture' => '',
          'lens' => '',
          'camera' => '',
          'category' => '',
        ),
      ),
      'collection' => false,
    );

    if ($collection) {
      if ($collection = $this->_updateCollection($collection)) {
        $ret['collection'] = $collection;
      }
    }

    return $this->jsonSuccess($ret);
  }

  protected function _actionDeleteFile($file) {
    $file->file_deleted = 1;
    $file->save();
  }

  /**
   *  Check if collection id is valid
   *
   *  @param {int} collection_id Collection id
   *  @return {boolean} Is collection valid
   */
  protected function _checkCollectionId($collection_id) {
    $collection_id = $collection_id ? $collection_id : 0;

    if (!preg_match('#^\d++$#', $collection_id)) {
      return false;
    }

    if (!$collection_id) {
      return true;
    }

    if (!($collection = PhotoLibraryCollections::find($collection_id))) {
      return false;
    }

    return !$collection->collection->collection_deleted;
  }

  /**
   *  Update collections stats
   *
   *  @param {int} collection_id Collection id
   *  @return {boolean} Is collection valid
   */
  protected function _updateCollection($collection_id) {
    if (!($collection = PhotoLibraryCollections::find($collection_id))) {
      return false;
    }

    $collection->collection_updated = $collection->collection_created;
    $collection->collection_cover_photo_id = 0;
    $collection->collection_cover_photo_hash = '';
    $collection->collection_photos = 0;

    $photo = PhotoLibrary::where('photo_collection_id', '=', $collection_id);
    $photo->whereAnd('photo_deleted', '=', 0);

    $collection->collection_photos = $photo->count();

    $photo->limit(1);
    $photo->orderBy('photo_added', 'desc');
    $photo = $photo->get();

    $preview = '';

    if (count($photo)) {
      $collection->collection_cover_photo_id = $photo[0]->file_id;
      $collection->collection_cover_photo_hash = $photo[0]->file_hash;
      $collection->collection_updated = $photo[0]->photo_added;

      $preview = StoragePreview::makePreviewLink(
        $photo[0]->file_hash, array(
          'crop'   => true,
          'width'  => 200,
          'height' => 150,
          'align'  => 'center',
          'valign' => 'middle',
      ));
    }

    $collection->save();

    return array(
      'id'      => $collection->collection_id,
      'photos'  => $collection->collection_photos,
      'cover'   => $preview,
      'updated' => $collection->collection_updated,
    );
  }
}
?>