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

    return $this->jsonSuccess($ret);
  }

  /**
   *  Create new photo collection
   *
   *  @param {string} collection Collection name
   *  @return {object} Collection object
   */
  public function actionCreateCollection() {
    return $this->jsonError();
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
    $photo->photo_collection_id = 0;
    $photo->photo_size = "{$size[0]}x{$size[1]}";
    $photo->save();

    $preview = StoragePreview::makePreviewLink(
      $photo->file_hash,array(
        'crop'   => true,
        'width'  => 200,
        'height' => 150,
        'align'  => 'center',
        'valign' => 'top',
    ));

    return $this->jsonSuccess(array(
      'id'            => (int)$photo->file_id,
      'gps'           => '',
      'taken'         => '',
      'title_ru'      => '',
      'title_en'      => '',
      'preview'       => $preview,
      'collection_id' => (int)$photo->photo_collection_id,
    ));
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

    $collections = Database::from('hotolibrary_collections');
    $collections->where('user_id', '=', User::get_user_id());
    $collections->whereAnd('collection_deleted', '=', 0);

    foreach ($collections->get() as $collection) {
      if ($collection->collection_id != $collection_id) {
        continue;
      }

      return true;
    }

    return false;
  }
}
?>