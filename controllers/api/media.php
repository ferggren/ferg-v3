<?php
class ApiMedia_Controller extends AjaxController {
  public static $user_auth = true;
  public static $user_access_level = 'admin';

  public function actionIndex() {
    return $this->jsonError('access_denied');
  }

  /**
   *  Return media entry
   *
   *  @param {string} key Entry key
   *  @param {string} lang Entry lang
   *  @return {object} Entry
   */
  public function actionGetEntry($key, $lang) {
    if (!($entry_id = $this->_getEntryId($key))) {
      return $this->jsonError('incorrect_entry_key');
    }

    if (!in_array($lang, array('ru', 'en'))) {
      $lang = 'any';
    }

    if (!($entry = $this->_getEntryContent($entry_id, $lang))) {
      return $this->jsonError('internal_error');
    }

    return $this->jsonSuccess(array(
      "title"   => $entry->entry_title,
      "desc"    => $entry->entry_desc,
      "text"    => $entry->entry_text_raw,
      "visible" => !!$entry->entry_visible,
    ));
  }

  /**
   *  Update entry
   *
   *  @param {string} key Entry key
   *  @param {string} lang Entry lang
   *  @param {string} title Entry new title
   *  @param {string} desc Entry new desc
   *  @param {string} text Entry new text
   *  @return {boolean} Status
   */
  public function actionUpdateEntry($key, $lang, $title, $visible, $desc, $text) {
    if (!($entry_id = $this->_getEntryId($key))) {
      return $this->jsonError('incorrect_entry_key');
    }

    if (!in_array($lang, array('ru', 'en'))) {
      $lang = 'any';
    }

    if (!($entry = $this->_getEntryContent($entry_id, $lang))) {
      return $this->jsonError('internal_error');
    }

    if (!preg_match('#^[0-9a-zA-ZАаБбВвГгДдЕеЁёЖжЗзИиЙйКкЛлМмНнОоПпРрСсТтУуФфХхЦцЧчШшЩщЪъЫыЬьЭэЮюЯя?.,?!\s:/_-]{0,100}$#iu', $title)) {
      return $this->jsonError('incorrect_title');
    }

    if (!preg_match('#^[0-9a-zA-ZАаБбВвГгДдЕеЁёЖжЗзИиЙйКкЛлМмНнОоПпРрСсТтУуФфХхЦцЧчШшЩщЪъЫыЬьЭэЮюЯя?.,?!\s:/_-]{0,200}$#iu', $desc)) {
      return $this->jsonError('incorrect_desc');
    }

    if (iconv_strlen($text) > 65535) {
      return $this->jsonError('incorrect_text');
    }

    $entry->entry_title     = $title;
    $entry->entry_desc      = $desc;
    $entry->entry_text_raw  = $text;
    $entry->entry_text_html = $this->_translateToHtml($text);
    $entry->entry_visible   = $visible == 'visible' ? '1' : '0';
    $entry->save();

    return $this->jsonSuccess();
  }

  /**
   *  Return media entry photos
   *
   *  @param {string} key Entry key
   *  @return {object} Entry photos
   */
  public function actionGetPhotos($key) {
    if (!($entry_id = $this->_getEntryId($key))) {
      return $this->jsonError('incorrect_entry_key');
    }

    return $this->jsonSuccess(
      $this->_getEntryPhotos($entry_id)
    );
  }

  /**
   *  Attach photos to media entry
   *
   *  @param {string} key Entry key
   *  @param {string} photos Comma-separated photos ID 
   *  @return {object} New entry photos
   */
  public function actionAddPhotos($key, $photos) {
    if (!($entry_id = $this->_getEntryId($key))) {
      return $this->jsonError('incorrect_entry_key');
    }

    if (!preg_match('#^[0-9,]{1,500}$#', $photos)) {
      return $this->jsonError('incorrect_photos_ids');
    }

    $insert = array();

    foreach (explode(',', $photos) as $photo) {
      if (!($photo = trim($photo))) {
        continue;
      }

      $insert[$photo] = true;
    }

    $res = Database::from('media_entries_photos');
    $res->where('entry_id', '=', $entry_id);

    foreach ($res->get() as $photo) {
      if (!isset($insert[$photo->photo_id])) {
        continue;
      }

      $insert[$photo->photo_id] = false;
    }

    foreach ($insert as $photo_id => $needed) {
      if (!$needed) {
        continue;
      }

      $photo = new Database('media_entries_photos');
      $photo->photo_id = $photo_id;
      $photo->entry_id = $entry_id;
      $photo->save();
    }

    return $this->jsonSuccess(
      $this->_getEntryPhotos($entry_id)
    );
  }

  /**
   *  Delete photo
   *
   *  @param {string} key Entry key
   *  @param {ing} photo_id Photo id
   *  @return {boolean} Result
   */
  public function actionDeletePhoto($key, $photo_id) {
    if (!($entry_id = $this->_getEntryId($key))) {
      return $this->jsonError('incorrect_entry_key');
    }

    if (!preg_match('#^[0-9]{1,10}$#', $photo_id)) {
      return $this->jsonError('incorrect_photos_ids');
    }

    $photo = Database::from('media_entries_photos');
    $photo->where('entry_id', '=', $entry_id);
    $photo->whereAnd('photo_id', '=', $photo_id);
    $photo = $photo->get();

    if (!count($photo)) {
      return $this->jsonSuccess();
    }

    if (count($photo) != 1) {
      return $this->jsonError('internal_error');
    }

    $photo[0]->delete();

    return $this->jsonSuccess();
  }

  /**
   *  Return entry ID
   *
   *  @param {string} key Entry key
   *  @return {int} Entry id
   */
  protected function _getEntryId($key) {
    if (!preg_match('#^[0-9a-z_.-]{1,50}$#iu', $key)) {
      return false;
    }

    $entry = Database::from('media_entries');
    $entry->where('entry_key', '=', $key);
    $entry = $entry->get();

    if (count($entry)) {
      return count($entry) == 1 ? $entry[0]->entry_id : false;
    }

    $entry = new Database('media_entries');
    $entry->entry_key = $key;
    $entry->save();

    return $entry->entry_id;
  }

  /**
   * Return entry photos
   *
   *  @param {int} entry_id Entry id
   *  @return {object} Photo IDs
   */
  protected function _getEntryPhotos($entry_id) {
    $entry_photos = array();

    $res = Database::from('media_entries_photos');
    $res->where('entry_id', '=', $entry_id);

    foreach ($res->get() as $photo) {
      $entry_photos[$photo->photo_id] = false;
    }

    if (!count($entry_photos)) {
      return array();
    }

    $res = Database::from(array(
      'photolibrary l',
      'storage_files f',
    ));

    $res->where('l.file_id', 'IN', array_keys($entry_photos));
    $res->whereAnd('l.photo_deleted', '=', '0');
    $res->whereAnd('f.file_id', '=', 'l.file_id', false);
    $res->orderBy('l.file_id', 'desc');

    foreach ($res->get() as $photo) {
      $entry_photos[$photo->file_id] = array(
        'id'      => $photo->file_id,
        'name'    => $photo->file_name,
        'preview' => StoragePreview::makePreviewLink(
          $photo->file_hash,array(
            'crop'   => true,
            'width'  => 200,
            'height' => 150,
            'align'  => 'center',
            'valign' => 'middle',
          )
        ),
      );
    }

    $delete = array();
    $ret    = array();

    foreach ($entry_photos as $photo_id => $info) {
      if (!is_array($info)) {
        $delete[] = $photo_id;
        continue;
      }

      $ret[] = $info;
    }

    if (!count($delete)) {
      return $ret;
    }

    $photos = Database::from('media_entries_photos');
    $photos->where('photo_id', 'IN', $delete);
    $photos->delete();

    return $ret;
  }

  /**
   *  Get entry content object
   *
   *  @param {int} entry_id Entry id
   *  @param {string} entry_lang Entry lang
   *  @return {object} Entry content object
   */
  protected function _getEntryContent($entry_id, $entry_lang) {
    $entry = Database::from('media_entries_content');
    $entry->where('entry_id', '=', $entry_id);
    $entry->whereAnd('entry_lang', '=', $entry_lang);
    $entry = $entry->get();

    if (count($entry)) {
      return count($entry) == 1 ? $entry[0] : false;
    }

    $entry = new Database('media_entries_content');
    $entry->entry_id = $entry_id;
    $entry->entry_lang = $entry_lang;
    $entry->save();

    return $entry;
  }

  /**
   *  Translate raw text to html
   */
  protected function _translateToHtml($text_raw) {
    return $text_raw;
  }
}