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
   *  Return user photos
   *
   *  @param {int} page Page id
   *  @param {string} tags List of comma-seperated tags
   *  @param {int} group Group id
   *  @return {object} Photos
   */
  public function actionGetPhotos($page = 1, $tags = '', $group = 0, $orderby = 'latest') {
    $ret = array(
      'page'   => 1,
      'pages'  => 1,
      'photos' => array(),
    );

    return $this->jsonSuccess($ret);
  }

  /**
   *  Return user photo groups (with statistics)
   *
   *  @return {object} Groups
   */
  public function actionGetGroups() {
    $ret = array();

    return $this->jsonSuccess();
  }

  /**
   *  Create new photo group
   *
   *  @param {string} group Group name
   *  @return {int} Group id
   */
  public function actionCreateGroup() {
    return $this->jsonError();
  }

  /**
   *  Create new photo
   *
   *  @param {int} file_id Storage file id
   *  @param {int} group Group id
   *  @return {object} Photo
   */
  public function actionAddPhoto($file_id = 0, $group = 0) {
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

    $info = array();

    if (!($size = getimagesize(ROOT_PATH . $file->file_path, $info))) {
      $this->_actionDeleteFile($file);
      return $this->jsonError('invalid_file');
    }

    $photo = new PhotoLibrary;
    $photo->file_id = $file_id;
    $photo->file_hash = $file->file_hash;
    $photo->photo_group_id = 0;
    $photo->photo_size = "{$size[0]}x{$size[1]}";
    $photo->save();

    $preview = StoragePreview::makePreviewLink(
      $photo->file_hash,array(
        'crop'   => true,
        'width'  => 200,
        'height' => 150,
        'align'  => 'center',
        'valign' => 'middle',
    ));

    return $this->jsonSuccess(array(
      'id'       => (int)$photo->file_id,
      'group_id' => (int)$photo->photo_group_id,
      'gps'      => '',
      'taken'    => '',
      'title_ru' => '',
      'title_en' => '',
      'preview'  => $preview,
    ));
  }

  protected function _actionDeleteFile($file) {
    $file->file_deleted = 1;
    $file->save();
  }
}
?>