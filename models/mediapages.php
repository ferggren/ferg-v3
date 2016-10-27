<?php
class MediaPages extends Database {
  protected static $table = 'media_pages';
  protected static $primary_key = 'page_id';
  protected static $timestamps = true;

  public function export() {
    $ret = array(
      'id'       => (int)$this->page_id,
      'type'     => $this->page_type,
      'visible'  => !!$this->page_visible,
      'versions' => array(),
      'date'     => $this->page_date,
      'timetamp' => (int)$this->page_date_timestamp,
      'tags'     => $this->page_tags,
      'preview'  => array(
        'big'  => '',
        'small' => '',
      ),
    );

    if ($this->page_versions) {
      $ret['versions'] = explode(',', $this->page_versions);
    }

    if ($this->page_photo_id) {
      $ret['preview'] = $this->_makePreview($this->page_photo_id);
    }

    return $ret;
  }

  protected function _makePreview($photo_id) {
    $ret = array(
      'big'   => '',
      'small' => '',
    );

    if (!$photo_id) {
      return $ret;
    }

    if (!($photo = PhotoLibrary::find($photo_id))) {
      return $ret;
    }

    if ($photo->photo_deleted) {
      $this->page_photo_id = 0;
      $this->save();

      return $ret;
    }

    return array(
      'big' => StoragePreview::makePreviewLink(
        $photo->file_hash,array(
          'crop'   => true,
          'width'  => 1920,
          'align'  => 'center',
          'valign' => 'middle',
        )
      ),

      'small' => StoragePreview::makePreviewLink(
        $photo->file_hash,array(
          'crop'   => true,
          'width'  => 500,
          'height' => 200,
          'align'  => 'center',
          'valign' => 'middle',
        )
      ),
    );
  }
}