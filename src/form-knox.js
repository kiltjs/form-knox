
import { _noop, _remove, _defineProperty } from './utils';
import {formData} from './form-helpers';

function runListeners (listeners, args, this_arg) {
  for( var i = 0, n = listeners.length ; i < n ; i++ ) {
    listeners[i].apply(this_arg, args);
  }
}

function formBind (form, onSubmit, options) {
  options = options || {};

  if( !(onSubmit instanceof Function) ) {
    options = onSubmit || options;
    onSubmit = _noop;
  }

  if( options.novalidate ) form.setAttribute('novalidate', '');

  var listeners = { invalid: [], reset: [], submitting: [] },
      use_capture = options.use_capture || options.use_capture === undefined,
      _onSubmit = function (e) {

        if( form.hasAttribute('novalidate') ) {
          var valid = form.checkValidity(),
              input_invalid = form.querySelector(':invalid');

          onSubmit(e, valid);
          if( e.defaultPrevented ) return;

          if( !valid ) runListeners( listeners.invalid, [], form);
          runListeners( listeners.submitting, [valid], form);

          if( options.focus_invalid && input_invalid ) input_invalid.focus();

        } else {
          runListeners( listeners.submitting, [true], form);
          onSubmit(e, true);
        }

      };

  form.addEventListener('submit', _onSubmit, use_capture );
  form.addEventListener('invalid', function _onInvalid () {
    runListeners( listeners.invalid, [], form);
    if( !form.hasAttribute('novalidate') ) runListeners( listeners.submitting, [false], form);
    form.removeEventListener('invalid', _onInvalid, use_capture);
    setTimeout(function () {
      form.addEventListener('invalid', _onInvalid, use_capture);
    });
  }, use_capture);

  var instance = {
    form: form,
    on: function (event_name, listener, use_capture) {
      if( listeners[event_name] ) listeners[event_name].push(listener);
      else form.addEventListener(event_name, listener, use_capture);
      return instance;
    },
    off: function (event_name, listener, use_capture) {
      if( listeners[event_name] ) _remove(listeners[event_name], listener);
      else form.removeEventListener(event_name, listener, use_capture);
      return instance;
    },
  };

  _defineProperty(instance, 'data', function () {
    if( options.processParams ) {
      return options.processParams( formData(form) );
    }
    return formData(form);
  });

  return instance;
}

export default formBind;
