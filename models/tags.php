<?php
/**
 *  Tags 
 */
class Tags {
  /**
   *  Return all tags in tag group
   *
   *  @param {object} tags List of tag groups
   *  @return {object} Tags for each of the tag group
   */
  public static function getTagValues($tags) {
    if (!is_array($tags)) {
      $tags = array($tags);
    }

    $ret = array();
    $where_in = array();

    foreach ($tags as $tag) {
      $ret[$tag] = array();

      if (!($tag = trim($tag))) {
        continue;
      }

      $where_in[] = "'".Database::escape($tag)."'";
    }

    if (!($where_in = implode(',', $where_in))) {
      return count($ret) == 1 ? $ret[$tags[0]] : $ret;
    }

    $values = Database::from(array(
      'tags t',
      'tags_values tv',
    ));

    $values->whereRaw(
      "t.tag_name IN ({$where_in}) AND
       tv.tag_id = t.tag_id AND
       tv.amount > 0"
    );

    $values->orderBy('tv.value', 'asc');

    foreach ($values->get() as $value) {
      if (!isset($ret[$value->tag_name])) {
        continue;
      }

      $ret[$value->tag_name][$value->value] = (int)$value->amount;
    }

    return count($ret) == 1 ? $ret[$tags[0]] : $ret;
  }

  /**
   *  Return all targets attached to the tag
   *
   *  @param {string} tag Tag group
   *  @param {string} target_values Tag value
   *  @return {object} List of tag targets
   */
  public static function getTagTargets($tag, $target_value) {
    if (!($tag_id = self::_getTagId($tag, false))) {
      return array();
    }

    if (!($value = self::_getValueObject($tag_id, $target_value, false))) {
      return array();
    }

    $targets = Database::from('tags_targets');
    $targets->whereAnd('value_id', '=', $value->value_id);

    $ret = array();

    foreach ($targets->get() as $target) {
      $ret[] = $target->target_id;
    }

    return $ret;
  }

  /**
   *  Attach target to a tag
   *
   *  @param {string} tag Tag group
   *  @param {int} target_id Target id
   *  @param {string} target_values Tag value
   */
  public static function attachTag($tag, $target_id, $target_values) {
    if (!($tag_id = self::_getTagId($tag))) {
      return false;
    }

    if (!preg_match('#^\d++$#', $target_id)) {
      return false;
    }

    // decrease counters
    $values = Database::from(array(
      'tags_targets tt',
      'tags_values tv',
    ));
    $values->whereAnd('tt.tag_id', '=', $tag_id);
    $values->whereAnd('tt.target_id', '=', $target_id);
    $values->whereAnd('tv.value_id', '=', 'tt.value_id', false);

    foreach ($values->get() as $value) {
      $tag_value = Database::from('tags_values');
      $tag_value->whereAnd('value_id', '=', $value->value_id);
      $tag_value = $tag_value->get();

      if (count($tag_value) != 1) {
        return false;
      }

      $tag_value = $tag_value[0];

      $tag_value->amount = $tag_value->amount - 1;
      $tag_value->save();
    }

    // remove attached tags
    $delete = Database::from('tags_targets');
    $delete->whereAnd('tag_id', '=', $tag_id);
    $delete->whereAnd('target_id', '=', $target_id);
    $delete->delete();

    // attach tags
    foreach ($target_values as $target_value) {
      if (!($value = self::_getValueObject($tag_id, $target_value))) {
        continue;
      }

      $rel = new Database('tags_targets');
      $rel->tag_id = $tag_id;
      $rel->value_id = $value->value_id;
      $rel->target_id = $target_id;
      $rel->save();

      $value->amount = (int)$value->amount + 1;
      $value->save();
    }

    return true;
  }

  /**
   *  Return tag group id by tag group name
   *
   *  @param {string} tag_name Tag name
   *  @param {boolean} insert Create and return new tag group, if not exists
   *  @return {int} Tag id
   */
  protected static function _getTagId($tag_name, $insert = true) {
    $tag_name = trim($tag_name);

    if (!$tag_name) {
      return false;
    }

    static $cache = false;

    if ($cache === false) {
      $cache = array();

      foreach(Database::from('tags')->get() as $row) {
        $cache[$row->tag_name] = $row->tag_id;
      }
    }

    if (isset($cache[$tag_name])) {
      return $cache[$tag_name];
    }

    if (!$insert) {
      return false;
    }

    $tag = new Database('tags');
    $tag->tag_name = $tag_name;
    $tag->save();

    return $cache[$tag_name] = $tag->tag_id;
  }


  /**
   *  Return tag object
   *
   *  @param {int} tag_id Tag group id
   *  @param {string} target_value Tag 
   *  @param {boolean} insert Create and return new tag, if not exists
   *  @return {int} Tag id
   */
  protected static function _getValueObject($tag_id, $target_value, $insert = true) {
    $target_value = trim($target_value);

    $value = Database::from('tags_values');
    $value->whereAnd('tag_id', '=', $tag_id);
    $value->whereAnd('value', 'LIKE', $target_value);
    $value = $value->get();

    if (count($value) > 0) {
      if (count($value) != 1) {
        return false;
      }

      return $value[0];
    }

    if (!$insert) {
      return false;
    }

    $value = new Database('tags_values');
    $value->tag_id = $tag_id;
    $value->value = $target_value;
    $value->amount = 0;
    $value->save();

    return $value;
  }
}
?>