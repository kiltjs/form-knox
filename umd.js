/* global define */

(function (factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else if ( 'define' in window && window.define.amd ) define([], factory);
  else window.formKnox = factory();
})(function () {

  var formKnox = require('./form-knox'),
      input = require('./input'),
      mask = require('./mask');

  formKnox.input = input;
  formKnox.mask = mask;

  return formKnox(formKnox, mask);

});
