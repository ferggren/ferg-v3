function clone(target) {
  if (target == null || typeof target != 'object') {
    return target;
  }

  if (target instanceof Array) {
    copy = [];

    for (var i = 0, len = target.length; i < len; i++) {
      copy[i] = typeof target[i] == 'object' ? clone(target[i]) : target[i];
    }

    return copy;
  }

  if (target instanceof Object) {
    var copy = {};

    for (var attr in target) {
      if (!target.hasOwnProperty(attr)) {
        continue;
      }

      copy[attr] = typeof target[attr] == 'object' ? clone(target[attr]) : target[attr];
    }

    return copy;
  }

  return false;
}

module.exports = clone;