"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _utils = require("./utils");

var _formHelpers = require("./form-helpers");

function runListeners(listeners, args, this_arg) {
  for (var i = 0, n = listeners.length; i < n; i++) {
    listeners[i].apply(this_arg, args);
  }
}

function formBind(form, onSubmit, options) {
  options = options || {};

  if (!(onSubmit instanceof Function)) {
    options = onSubmit || options;
    onSubmit = _utils._noop;
  }

  if (options.novalidate) form.setAttribute('novalidate', '');

  var listeners = {
    invalid: [],
    reset: [],
    submitting: []
  },
      use_capture = options.use_capture || options.use_capture === undefined,
      _onSubmit = function _onSubmit(e) {
    if (form.hasAttribute('novalidate')) {
      var valid = form.checkValidity(),
          input_invalid = form.querySelector(':invalid');
      onSubmit(e, valid);
      if (e.defaultPrevented) return;
      if (!valid) runListeners(listeners.invalid, [], form);
      runListeners(listeners.submitting, [valid], form);
      if (options.focus_invalid && input_invalid) input_invalid.focus();
    } else {
      runListeners(listeners.submitting, [true], form);
      onSubmit(e, true);
    }
  };

  form.addEventListener('submit', _onSubmit, use_capture);
  form.addEventListener('invalid', function _onInvalid() {
    runListeners(listeners.invalid, [], form);
    if (!form.hasAttribute('novalidate')) runListeners(listeners.submitting, [false], form);
    form.removeEventListener('invalid', _onInvalid, use_capture);
    setTimeout(function () {
      form.addEventListener('invalid', _onInvalid, use_capture);
    });
  }, use_capture);
  var instance = {
    form: form,
    on: function on(event_name, listener, use_capture) {
      if (listeners[event_name]) listeners[event_name].push(listener);else form.addEventListener(event_name, listener, use_capture);
      return instance;
    },
    off: function off(event_name, listener, use_capture) {
      if (listeners[event_name]) (0, _utils._remove)(listeners[event_name], listener);else form.removeEventListener(event_name, listener, use_capture);
      return instance;
    }
  };
  (0, _utils._defineProperty)(instance, 'data', function () {
    if (options.processParams) {
      return options.processParams((0, _formHelpers.formData)(form));
    }

    return (0, _formHelpers.formData)(form);
  });
  return instance;
}

var _default = formBind;
exports.default = _default;
module.exports = exports.default;