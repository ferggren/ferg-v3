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

    }

    return $ret;
  }
}