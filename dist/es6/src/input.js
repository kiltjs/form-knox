/* global navigator */

import { _noop, is_android, _remove, _defineProperty } from './utils';

// https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation
// https://developer.mozilla.org/en-US/docs/Learn/HTML/Forms/HTML5_updates#Constraint_Validation_API
// https://developer.mozilla.org/es/docs/Web/API/ValidityState

function getValidityError (validity) {
  for( var key in validity ) {
    if( validity[key] ) return key.replace(/([a-z])([A-Z])/g, function (_matched, a, b) {
      return a + '_' + b.toLowerCase();
    });
  }
  return 'invalid';
}

function runListeners (listeners, args, this_arg) {
  for( var i = 0, n = listeners.length ; i < n ; i++ ) {
    listeners[i].apply(this_arg, args);
  }
}

function setInputAttributes (component, attrs) {
  for( var key in attrs ) component.attr(key, attrs[key]);
}

function initInput (input, options) {
  options = options || {};

  var previous_value = input.value,
      mask_filled = null,
      custom_error = null,
      error_key = null,
      validation_message = '',
      listeners = { change: [] };

  if( !input.hasAttribute('type') ) input.setAttribute('type', options.type || ( options.number ? 'tel' : 'text' ) );

  var _inputMask = options.mask instanceof Function ? options.mask : null,
      plainValue = options.plain ? function (value) {
        return _inputMask(value).plain;
      } : function (value) { return value; };

  var applyMask = _inputMask ? function () {
    var result;

    try {
      result = _inputMask(input.value, previous_value);
    } catch (err) {
      if( typeof err !== 'string' ) throw err;
      custom_error = err;
      checkValidity();
      return;
    }

    if( !result && result !== '' ) return;

    if( 'value' in result ) {
      input.value = result.value;
      mask_filled = result.filled;
    } else {
      input.value = result;
      mask_filled = false;
    }
  } : _noop;

  function getErrorKey () {
    input.setCustomValidity('');
    validation_message = input.validationMessage;

    if( custom_error ) return custom_error;

    if( input.value ) {

      return (
        options.customError && options.customError( plainValue(input.value), mask_filled, input.value )
      ) || (
        input.validity && !input.validity.valid && getValidityError(input.validity)
      ) || (
        _inputMask && !mask_filled && 'uncomplete'
      );

    } else if( input.hasAttribute('required') ) return 'required';
  }

  if( options.onChange instanceof Function ) listeners.change.push(options.onChange);

  function checkValidity () {
    error_key = getErrorKey();
    var custom_error_message = options.getErrorMessage && options.getErrorMessage(error_key);
    if( custom_error_message ) input.setCustomValidity(custom_error_message);
    runListeners(listeners.change, [plainValue(input.value), mask_filled, error_key, previous_value, custom_error_message || validation_message ], input);
  }
  setTimeout(checkValidity, 0);

  function onInput () {
    if( input.value === previous_value ) return;
    custom_error = null;
    applyMask();
    previous_value = input.value;
    checkValidity();
  }

  input.addEventListener( is_android ? 'keyup' : 'input' , onInput, options.use_capture );
  input.addEventListener('change' , onInput, options.use_capture );
  input.addEventListener('blur' , onInput, options.use_capture );

  var component = {
    input: input,
    focus: function () {
      return input.focus();
    },
    setCustomValidity: function (message) {
      input.setCustomValidity(message);
      // custom_error = 'custom';
      // checkValidity();
      return this;
    },
    setError: function (error_key) {
      custom_error = error_key;
      checkValidity();
      return this;
    },
    setRequired: function (required) {
      custom_error = null;
      if( required ) {
        input.setAttribute('required', '');
      } else if( input.hasAttribute('required') ) {
        input.removeAttribute('required');
      }
      checkValidity();
      return this;
    },
    attr: function (key, value) {
      if( value === undefined ) return input.getAttribute(key);
      else if( value === null ) input.removeAttribute(key);
      else input.setAttribute(key, value);
      checkValidity();
      return this;
    },
    on: function (event_name, listener, use_capture) {
      if( listeners[event_name] ) listeners[event_name].push(listener);
      else input.addEventListener(event_name, listener, use_capture);
      return this;
    },
    off: function (event_name, listener, use_capture) {
      if( listeners[event_name] ) _remove(listeners[event_name], listener);
      else input.removeEventListener(event_name, listener, use_capture);
      return this;
    },
    checkValidity: checkValidity,
    unbind: function () {
      input.removeEventListener( is_android ? 'keyup' : 'input' , onInput, options.use_capture );
      input.removeEventListener('blur' , onInput, options.use_capture );
      input.removeEventListener('change' , onInput, options.use_capture );
      return this;
    }
  };

  _defineProperty(component, 'value', function () {
    return plainValue(input.value);
  }, function (value) {
    previous_value = '';
    input.value = value || '';
    onInput();
  });

  _defineProperty(component, 'filled', function () {
    return mask_filled;
  });

  _defineProperty(component, 'valid', function () {
    return !error_key;
  });

  _defineProperty(component, 'model', options.toModel ? function () {
    return options.toModel( plainValue(input.value) );
  } : ( options.number ? function () {
    return Number( plainValue(input.value) );
  } : function () {
    return plainValue(input.value);
  }), options.fromModel ? function (model) {
    component.value = options.fromModel(model);
  } : function (model) {
    component.value = model;
  });

  _defineProperty(component, 'is_required', function () {
    return input.hasAttribute('required');
  });

  if( options.value ) {
    component.setAttribute('value', options.value);
    previous_value = options.value;
  }

  if( options.attrs ) setInputAttributes(component, options.attrs);
  onInput();

  return component;
}

export default initInput;
