'use strict';

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

    if( options.onInvalid && !valid ) {
      return options.onInvalid(e);
    }

    if( options.focus_invalid !== false && form.querySelector(':invalid') ) {
      form.querySelector(':invalid').focus();
    }

    onSubmit(e, valid);
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
