<?php
class PhotoLibrary extends Database {
  protected static $table = 'photolibrary';
  protected static $primary_key = 'file_id';
  protected static $timestamps = false;
}
?>