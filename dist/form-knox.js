(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

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

function formSubmitNoValidate (form, e) {
  var valid = form.checkValidity();

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

function formSubmit (form, onSubmit, options) {
  options = options || {};
  if( !(onSubmit instanceof Function) ) {
    options = onSubmit || options;
    onSubmit = _noop;
  }

  if( options.novalidate ) form.setAttribute('novalidate', 'novalidate');

  form.addEventListener('submit', function (e) {
    if( options.novalidate ) formSubmitNoValidate(form, e);
    else form.checkValidity();

    if( options.submitting ) setTimeout(function () {
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

    onSubmit(e);
  }, true);
}

function formKnox (_env, createMask) {
  var formats = {},
      env = _env || {},
      error_messages = {};

  env.defineFormat = function (format_name, format_options) {
    var new_format = Object.create( typeof format_options === 'string' ? { mask: format_options } : format_options );

    if( typeof new_format.mask === 'string' ) {
      if( !formKnox.mask && !( createMask instanceof Function ) ) throw new Error('createMask should be a function');
      new_format.mask = createMask(format_options.mask);
    } else if( new_format.mask instanceof Function ) new_format.mask = format_options.mask;
    else if( new_format.mask ) throw new Error('mask should be a string or a function');

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

  env.submit = formSubmit;
  env.params = formParams;

  return env;
}

module.exports = formKnox;

},{}],2:[function(require,module,exports){
/* global navigator */

var _noop = function () {};
var is_android = typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Android') !== -1;

// https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation
// https://developer.mozilla.org/es/docs/Web/API/ValidityState
function getValidityError (validity) {
  for( var key in validity ) {
    if( validity[key] ) return key.replace(/([a-z])([A-Z])/g, function (_matched, a, b) {
      return a + '_' + b.toLowerCase();
    });
  }
  return 'invalid';
}

module.exports = function input (input, options) {
  options = options || {};

  var previous_value = input.value,
      mask_filled = null,
      customError = options.customError || _noop,
      validation_message = '';

  var _inputMask = options.mask instanceof Function ? options.mask : null;

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

  function checkValidity () {
    onChange.apply(input, [input.value, previous_value, mask_filled, getErrorKey(), validation_message ]);
  }

  var onChange = options.onChange || _noop;

  function onInput (_e) {
    applyMask();
    previous_value = input.value;
    checkValidity();
  }

  function onBlur (e) {
    if(input.value !== previous_value) onInput(e);
  }

  input.addEventListener( is_android ? 'keyup' : 'input' , onInput, options.useCapture );
  input.addEventListener('blur' , onBlur, options.useCapture );

  return {
    input: input,
    checkValidity: checkValidity,
    unbind: function () {
      input.removeEventListener( is_android ? 'keyup' : 'input' , onInput, options.useCapture );
      input.removeEventListener('blur' , onBlur, options.useCapture );
    }
  };
};

},{}],3:[function(require,module,exports){

var matchValues = /{([a-z]+:)?[\w-]+}/g,
    matchParts = /{(([a-z]+):)?([\w-]+)}/;

var transformers = {
  up: function (value) { return value.toUpperCase(); },
  lo: function (value) { return value.toLowerCase(); }
};

module.exports = function inputMask (pattern) {
  var matchDigit = /\d/,
      markSeparators = pattern.split(matchValues).filter( (_v, i) => !(i%2) ),
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

  function mask (value, previousValue) {
    var separators = markSeparators.slice(),
        result = '',
        letters = value.split(''),
        i, n, letter,
        p = 0;

    for( i = 0, n = letters.length; i < n ; i++ ) {
      if( !patterns[p] ) return { value: result, filled: true };
      letter = patterns[p].transform ? patterns[p].transform(letters[i]) : letters[i];

      if( patterns[p].test(letter) ) {
        result += separators[p] + letter;
        p++;
      } else if( letter === separators[p][0] ) {
        result += separators[p][0];
        separators[p] = separators[p].substr(1);
      } else {
        return { value: result, filled: false };
      }
    }

    if( previousValue && value.length < previousValue.length ) {
      return {
        value: previousValue.substr(-1) === separators[p][0] ? result.substr(0, result.length - 1) : result,
        filled: p === patterns.length
      };
    }

    return {
      value: result + separators[p],
      filled: p === patterns.length
    };
  }

  return mask;
};

},{}],4:[function(require,module,exports){
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

},{"./form-knox":1,"./input":2,"./mask":3}]},{},[4]);