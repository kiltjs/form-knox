
export function _noop () {}

export var is_android = typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Android') !== -1;

export function _remove (list, item) {
  for( var i = list.length - 1 ; i >= 0 ; i-- ) {
    if( list[i] === item ) return list.splice(i, 1);
  }
}

export function _defineProperty (o, key, getter, setter) {
  Object.defineProperty(o, key, { get: getter, set: setter });
  return o;
}

export function _firstArg () {
  for( var i = 0, n = arguments.length ; i < n ; i++ ) {
    if( arguments[i] ) return arguments[i];
  }
}
