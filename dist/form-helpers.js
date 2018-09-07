'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formParams = formParams;
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

function formParams(form, selector) {
  if (!(form instanceof HTMLElement) && form.length) form = form[0];
  if (!(form instanceof HTMLElement)) throw new TypeError('parent node should be an HTMLElement');

  var data = {};
  _each.call(form.querySelectorAll(selector || 'input, select'), function (input) {

    if (!input.name || input.hasAttribute('disabled') || input.type === 'submit') return;

    if (input.nodeName === 'SELECT') {
      data[input.name] = input.selectedIndex ? _getInputValue(input.options[input.selectedIndex]) : null;
    } else if (input.type === 'radio') {
      if (input.checked) data[input.name] = _getInputValue(input);
    } else if (input.type === 'radio') {
      if ('model' in input) _getInputModel(input);else data[input.name] = input.checked;
    } else {
      data[input.name] = _getInputValue(input);
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