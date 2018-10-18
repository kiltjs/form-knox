"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._noop = _noop;
exports._remove = _remove;
exports._defineProperty = _defineProperty;
exports._firstArg = _firstArg;
exports.is_android = void 0;

function _noop() {}

var is_android = typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Android') !== -1;
exports.is_android = is_android;

function _remove(list, item) {
  for (var i = list.length - 1; i >= 0; i--) {
    if (list[i] === item) return list.splice(i, 1);
  }
}

function _defineProperty(o, key, getter, setter) {
  Object.defineProperty(o, key, {
    get: getter,
    set: setter
  });
  return o;
}

function _firstArg() {
  for (var i = 0, n = arguments.length; i < n; i++) {
    if (arguments[i]) return arguments[i];
  }
}