<?php
class ApiAdminPhotos_Controller extends AjaxController {
  public static $user_auth = true;
  public static $user_access_level = 'admin';

  /**
   *  Access error
   */
  public function actionIndex() {
    return $this->jsonError('access_denied');
  }

  public function actionGetPhotoUrl($photo_id) {
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

    if (!($file = StorageFiles::find($photo_id))) {
      return $this->jsonError('invalid_photo_id');
    }

    if ($file->file_deleted) {
      return $this->jsonError('invalid_photo_id');
    }

    return $this->jsonSuccess($file->exportInfo());
  }
}