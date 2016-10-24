<?php
class Tags {
  public static function getTagValues($tags) {
    if (!is_array($tags)) {
      $tags = array($tags);
    }

    $ret = array();

    foreach ($tags as $tag) {
      $ret[$tag] = array();
    }

    if (count($ret) == 1) {
      return $ret[$tags[0]];
    }

    return $ret;
  }

  public static function getTargetValues($tag, $target) {
    return false;
  }

  public static function attachTag($tag, $target, $value) {

  }

  public static function detachTag($tag, $target) {

  }
}
?>