/* global define */

(function (factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else if ( 'define' in window && window.define.amd ) define([], factory);
  else window.formKnox = factory();
})(function () {
  return require('./bundle');
});
