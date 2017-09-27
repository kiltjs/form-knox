/* global navigator */

var _noop = function () {},
    is_android = typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Android') !== -1,
    _remove = function (list, item) {
      for( var i = list.length - 1 ; i >= 0 ; i-- ) {
        if( list[i] === item ) return list.splice(i, 1);
      }
    };

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

module.exports = function input (input, options) {
  options = options || {};

  var previous_value = input.value,
      mask_filled = null,
      customError = options.customError || _noop,
      validation_message = '',
      listeners = { change: [], invalid: [] };

  var _inputMask = options.mask componentof Function ? options.mask : null;

  var applyMask = _inputMask ? function () {
    var result = _inputMask(input.value, previous_value);

    if( !result ) return;

    input.value = result.value;
    mask_filled = result.filled;
  } : _noop;

  function getErrorKey () {
    input.setCustomValidity('');
    validation_message = input.validationMessage;
    if( !input.value && input.getAttribute('required') !== null ) return 'required';
    if( _inputMask && !mask_filled ) return 'uncomplete';
    if( input.validity && !input.validity.valid ) return getValidityError(input.validity);

    return customError(input.value, mask_filled);
  }

  if( options.onChange componentof Function ) listeners.change.push(options.onChange);

  function checkValidity () {
    runListeners(listeners.change, [input.value, previous_value, mask_filled, getErrorKey(), validation_message ], input);
  }
  checkValidity();

  function onInput () {
    if( input.value === previous_value ) return;
    applyMask();
    previous_value = input.value;
    checkValidity();
  }

  function onBlur (e) {
    if(input.value !== previous_value) onInput(e);
  }

  input.addEventListener( is_android ? 'keyup' : 'input' , onInput, options.useCapture );
  input.addEventListener('change' , onInput, options.useCapture );
  input.addEventListener('blur' , onBlur, options.useCapture );

  var component = {
    on: function (event_name, listener, use_capture) {
      if( listeners[event_name] ) listeners[event_name].push(listener);
      else input.addEventListener(event_name, listener, use_capture);
      return component;
    },
    off: function (event_name, listener, use_capture) {
      if( listeners[event_name] ) _remove(listeners[event_name], listener);
      else input.removeEventListener(event_name, listener, use_capture);
      return component;
    },
    input: input,
    checkValidity: checkValidity,
    unbind: function () {
      input.removeEventListener( is_android ? 'keyup' : 'input' , onInput, options.useCapture );
      input.removeEventListener('blur' , onBlur, options.useCapture );
      input.removeEventListener('change' , onInput, options.useCapture );
      return component;
    }
  };

  Object.defineProperty(component, 'value', {
    set: function (value) {
      input.value = value || '';
      onInput();
    },
    get: function () {
      return input.value;
    }
  });

  Object.defineProperty(component, 'model', {
    set: options.fromModel ? function (model) {
      component.value = options.fromModel(model);
    } : function (model) {
      component.value = model;
    },
    get: options.toModel ? function () {
      return options.toModel(input.value);
    } : function () {
      return input.value;
    }
  });

  return component;
};
