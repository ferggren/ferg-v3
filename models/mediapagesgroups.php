<?php
class MediaPagesGroups extends Database {
    protected static $table = 'media_pages_groups';
    protected static $primary_key = 'group_name';
    protected static $timestamps = false;

    public static function updatePagesCount() {
        // magic
    }
}