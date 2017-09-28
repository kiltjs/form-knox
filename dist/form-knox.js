(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var formKnox = require('./form-knox'),
    input = require('./input'),
    mask = require('./mask');

formKnox.input = input;
formKnox.mask = mask;

module.exports = formKnox(formKnox, mask);

},{"./form-knox":2,"./input":3,"./mask":4}],2:[function(require,module,exports){

function _noop () {}

function formParams (form) {
  if( !(form instanceof Element) && form.length ) form = form[0];

  var data = {};
  [].forEach.call(form.elements, function (el) {
    if( el.name && !el.disabled ) {
      if( el.type === 'radio' ) {
        if( el.checked ) data[el.name] = el.value;
      } else {
        data[el.name] = el.value;
      }
    }
  });
  return data;
}

function formSubmitNoValidate (form, valid, e) {
  if( valid ) e.preventDefault();
  else if( form.getAttribute('novalidate') !== null ) {
    form.removeAttribute('novalidate');
    e.preventDefault();
    setTimeout(function () {
      var submit_button = form.querySelector('button[type=submit],[type=submit]');
      if( submit_button ) submit_button.click();
      form.setAttribute('novalidate', 'novalidate');
    });
  }
}

function _remove (list, item) {
  for( var i = list.length - 1 ; i >= 0 ; i-- ) {
    if( list[i] === item ) return list.splice(i, 1);
  }
}

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

  var listeners = { valid: [], invalid: [], reset: [] };

  if( options.novalidate ) form.setAttribute('novalidate', 'novalidate');

  form.addEventListener('submit', function (e) {
    var valid = form.checkValidity();

    if( options.novalidate ) formSubmitNoValidate(form, valid, e);
    else form.checkValidity();

    if( valid && options.submitting ) setTimeout(function () {
      var submit_button = form.querySelector('button[type=submit],[type=submit]');

      if( form.submitting ) {
        if( submit_button ) submit_button.setAttribute('disabled', 'disabled');

        form.submitting.then(function (result) {
          if( result !== 'no_redirect' ) submit_button.removeAttribute('disabled');
        }, function () {
          submit_button.removeAttribute('disabled');
        });

        options.submitting(form.submitting);
      }
    }, 0);

    runListeners( listeners[ valid ? 'valid' : 'invalid' ], [], form);

    if( !valid ) return;

    if( options.focus_invalid !== false && form.querySelector(':invalid') ) {
      form.querySelector(':invalid').focus();
    }

    onSubmit(e);
  }, true);

  form.addEventListener('reset', function () {
    runListeners( listeners[ form.checkValidity() ? 'valid' : 'invalid' ], [], form);
  });

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

  Object.defineProperty(instance, 'data', {
    get: function () { return formParams(form); }
  });

  return instance;
}

function formKnox (_env, createMask) {
  var formats = {},
      env = _env || {},
      error_messages = {};

  env.defineFormat = function (format_name, format_options) {
    var new_format = Object.create( typeof format_options === 'string' ? { mask: format_options } : format_options );

    if( createMask instanceof Function && typeof format_options.mask === 'string' ) new_format.mask = createMask(format_options.mask);
    else if( new_format.mask instanceof Function ) new_format.mask = format_options.mask;
    else if( new_format.mask ) throw new Error('mask should be a Function');

    formats[format_name] = new_format;
  };

  env.setErrorMessages = function (format_name, messages) {
    if( messages === undefined ) error_messages = format_name;
    else error_messages[format_name] = messages;
  };

  env.getErrorMessages = function (name) {
    return error_messages[name] || error_messages.default || null;
  };

  env.getFormat = function (format_name) {
    return formats[format_name];
  };

  env.form = formBind;
  env.params = formParams;

  return env;
}

formKnox(formKnox);

module.exports = formKnox;

},{}],3:[function(require,module,exports){
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

function defineProperty (o, key, getter, setter) {
  Object.defineProperty(o, key, { get: getter, set: setter });
}

function setInputAttributes (component, attrs) {
  for( var key in attrs ) component.attr(key, attrs[key]);
}

module.exports = function input (input, options) {
  options = options || {};

  var previous_value = input.value,
      mask_filled = null,
      custom_error = null,
      customError = options.customError || _noop,
      validation_message = '',
      listeners = { change: [] };

  var _inputMask = options.mask instanceof Function ? options.mask : null,
      plainValue = function (value) {
        return _inputMask(value).plain;
      };

  var applyMask = _inputMask ? function () {
    var result = _inputMask(input.value, previous_value);

    if( !result ) return;

    input.value = result.value;
    mask_filled = result.filled;
  } : _noop;

  function getErrorKey () {
    input.setCustomValidity('');
    validation_message = input.validationMessage;
    if( custom_error ) return custom_error;
    if( !input.value && input.getAttribute('required') !== null ) return 'required';
    if( _inputMask && !mask_filled ) return 'uncomplete';
    if( input.validity && !input.validity.valid ) return getValidityError(input.validity);

    return customError(input.value, mask_filled);
  }

  if( options.onChange instanceof Function ) listeners.change.push(options.onChange);

  function checkValidity () {
    runListeners(listeners.change, [plainValue(input.value), mask_filled, getErrorKey(), input.value, previous_value, validation_message ], input);
  }
  checkValidity();

  function onInput () {
    if( input.value === previous_value ) return;
    custom_error = null;
    applyMask();
    previous_value = input.value;
    checkValidity();
  }

  function onBlur (e) {
    if(input.value !== previous_value) onInput(e);
  }

  if( !input.getAttribute('type') ) input.setAttribute('type', options.type || ( options.number ? 'tel' : 'text' ) );

  input.addEventListener( is_android ? 'keyup' : 'input' , onInput, options.useCapture );
  input.addEventListener('change' , onInput, options.useCapture );
  input.addEventListener('blur' , onBlur, options.useCapture );

  var component = {
    input: input,
    setCustomValidity: function (message) {
      input.setCustomValidity(message);
      custom_error = 'custom';
      checkValidity();
      return this;
    },
    setError: function (error_key) {
      custom_error = error_key;
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
      input.removeEventListener( is_android ? 'keyup' : 'input' , onInput, options.useCapture );
      input.removeEventListener('blur' , onBlur, options.useCapture );
      input.removeEventListener('change' , onInput, options.useCapture );
      return this;
    }
  };

  defineProperty(component, 'value', function () {
    return input.value;
  }, function (value) {
    previous_value = '';
    input.value = value || '';
    onInput();
  });

  defineProperty(component, 'model', options.toModel ? function () {
    return options.toModel(input.value);
  } : ( options.number ? function () {
    return Number(input.value);
  } : function () {
    return input.value;
  }), options.fromModel ? function (model) {
    component.value = options.fromModel(model);
  } : function (model) {
    component.value = model;
  });

  if( options.value ) {
    component.setAttribute('value', options.value);
    previous_value = options.value;
  }

  if( options.attrs ) setInputAttributes(component, options.attrs);
  onInput();

  return component;
};

},{}],4:[function(require,module,exports){

var matchValues = /{([a-z]+:)?[\w-]+}/g,
    matchParts = /{(([a-z]+):)?([\w-]+)}/;

var transformers = {
  up: function (value) { return value.toUpperCase(); },
  lo: function (value) { return value.toLowerCase(); }
};

module.exports = function inputMask (pattern) {
  var matchDigit = /\d/,
      markSeparators = pattern.split(matchValues).filter( function (_v, i) { return !(i%2); }),
      patterns = pattern.match(matchValues).map(function (brackets) {
        if( brackets === '{9}' ) return matchDigit;
        var matches = brackets.match(matchParts);
        var pat = new RegExp('[' + matches[3] + ']');
        if( matches[2] ) {
          return {
            transform: transformers[matches[2]],
            test: pat.test.bind(pat)
          };
        }

        return pat;
      });

  function mask (value, previous_value) {
    var separators = markSeparators.slice(),
        result = '',
        plain = '',
        letters = value.split(''),
        i, n, letter,
        p = 0;

    for( i = 0, n = letters.length; i < n ; i++ ) {
      if( !patterns[p] ) return { value: result, plain: plain, filled: true };
      letter = patterns[p].transform ? patterns[p].transform(letters[i]) : letters[i];

      if( patterns[p].test(letter) ) {
        plain += letter;
        result += separators[p] + letter;
        p++;
      } else if( letter === separators[p][0] ) {
        result += separators[p][0];
        separators[p] = separators[p].substr(1);
      } else {
        return { value: result, plain: plain, filled: false };
      }
    }

    if( previous_value && value.length < previous_value.length ) {
      return {
        value: previous_value.substr(-1) === separators[p][0] ? result.substr(0, result.length - 1) : result,
        plain: previous_value.substr(-1) === separators[p][0] ? plain.substr(0, plain.length - 1) : plain,
        filled: p === patterns.length,
      };
    }

    return {
      value: result + separators[p],
      filled: p === patterns.length,
      plain: plain,
    };
  }

  return mask;
};

},{}],5:[function(require,module,exports){
/* global define */

(function (factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else if ( 'define' in window && window.define.amd ) define([], factory);
  else window.formKnox = factory();
})(function () {
  return require('./bundle');
});

},{"./bundle":1}]},{},[5]);
