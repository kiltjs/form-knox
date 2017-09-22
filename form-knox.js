
var mask = require('./mask');
var input = require('./input');

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

function formKnox (_env) {
  var formats = {},
      env = _env || {},
      error_messages = {};

  env.defineFormat = function (format_name, format_options) {
    var new_format = Object.create( typeof format_options === 'string' ? { mask: format_options } : format_options );

    if( typeof new_format.mask === 'string' ) new_format.mask = mask(format_options.mask);
    else if( new_format.mask instanceof Function ) new_format.mask = format_options.mask;
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

  env.mask = mask;
  env.input = input;

  env.submit = formSubmit;
  env.params = formParams;

  return env;
}

formKnox(formKnox);

module.exports = formKnox;
