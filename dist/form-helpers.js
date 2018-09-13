'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formData = formData;
exports.disableInputs = disableInputs;
exports.enableInputs = enableInputs;
exports.readonlyInputs = readonlyInputs;
exports.editableInputs = editableInputs;

function _getInputModel(input) {
  return input.model instanceof Function ? input.model() : input.model;
}

function _getInputValue(input) {
  if ('model' in input) return _getInputModel(input);
  return input.value;
}

var _each = Array.prototype.forEach;

function _setKey(o, keys, value) {
  var key = keys.shift();
  if (!key) throw new Error('keys length should be at least 1');
  if (!keys.length) {
    o[key] = value;
  } else {
    o[key] = o[key] || {};
    _setKey(o[key], keys, value);
  }
}

function setKey(o, key, value) {
  _setKey(o, key.replace(/^\[|\]$/g, '').replace(/\]\[|\[|\]/g, '.').split('.'), value);
}

function formData(form, selector) {
  if (!(form instanceof HTMLElement) && form.length) form = form[0];
  if (!(form instanceof HTMLElement)) throw new TypeError('parent node should be an HTMLElement');

  var data = {};
  _each.call(form.querySelectorAll(selector === true ? 'input, select' : selector || 'input:not([disabled]), select:not([disabled])'), function (input) {

    if (input.nodeName === 'SELECT') {
      setKey(data, input.name, input.selectedIndex ? _getInputValue(input.options[input.selectedIndex]) : null);
    } else if (input.type === 'radio') {
      if (input.checked) setKey(data, input.name, _getInputValue(input));
    } else if (input.type === 'checkbox') {
      setKey(data, input.name, 'model' in input ? _getInputModel(input) : input.checked);
    } else {
      setKey(data, input.name, _getInputValue(input));
    }
  });

  return data;
}

function disableInputs(form, selector) {
  _each.call(form.querySelectorAll(selector || 'input, select'), function (input) {
    if (!input.hasAttribute('disabled')) input.setAttribute('disabled', '');
  });
}

function enableInputs(form, selector) {
  _each.call(form.querySelectorAll(selector || 'input, select'), function (input) {
    if (input.hasAttribute('disabled')) input.removeAttribute('disabled', '');
  });
}

function readonlyInputs(form, selector) {
  _each.call(form.querySelectorAll(selector || 'input, select'), function (input) {
    if (!input.hasAttribute('readonly')) input.setAttribute('readonly', '');
  });
}

function editableInputs(form, selector) {
  _each.call(form.querySelectorAll(selector || 'input, select'), function (input) {
    if (input.hasAttribute('readonly')) input.removeAttribute('readonly', '');
  });
}