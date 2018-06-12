
import { _noop, _remove, _defineProperty } from './utils';

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

    if( options.novalidate ) {
      if( options.focus_invalid !== false ) formSubmitNoValidate(form, valid, e);
    } else form.checkValidity();

    if( valid && options.submitting_tweaks ) setTimeout(function () {
      var submit_button = form.querySelector('button[type=submit],[type=submit]');

      if( form.submitting_tweaks ) {
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

  _defineProperty(instance, 'data', function () { return formParams(form); });

  return instance;
}

formBind.getParams = formParams;

export default formBind;
