(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.formKnox = factory());
}(this, (function () { 'use strict';

  function _noop() {}
  var is_android = typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Android') !== -1;
  function _remove(list, item) {
    for (var i = list.length - 1; i >= 0; i--) {
      if (list[i] === item) return list.splice(i, 1);
    }
  }
  function _defineProperty(o, key, getter, setter) {
    Object.defineProperty(o, key, {
      get: getter,
      set: setter
    });
    return o;
  }

  function _getInputModel(input) {
    return input.model instanceof Function ? input.model() : input.model;
  }

  function _getInputValue(input) {
    if ('model' in input) return _getInputModel(input);
    return input.value;
  }

  var _each = Array.prototype.forEach;

  function _setKey(o, keys, value) {
    var key = keys.shift();
    if (!key) throw new Error('keys length should be at least 1');

    if (!keys.length) {
      o[key] = value;
    } else {
      o[key] = o[key] || {};

      _setKey(o[key], keys, value);
    }
  }

  function setKey(o, key, value) {
    _setKey(o, key.replace(/^\[|\]$/g, '').replace(/\]\[|\[|\]/g, '.').split('.'), value);
  }

  function formData(form, selector) {
    if (!(form instanceof HTMLElement) && form.length) form = form[0];
    if (!(form instanceof HTMLElement)) throw new TypeError('parent node should be an HTMLElement');
    var data = {};

    _each.call(form.querySelectorAll(selector === true ? 'input, select' : selector || 'input:not([disabled]), select:not([disabled])'), function (input) {
      if (!input.name) return;

      if (input.nodeName === 'SELECT') {
        setKey(data, input.name, input.selectedIndex ? _getInputValue(input.options[input.selectedIndex]) : null);
      } else if (input.type === 'radio') {
        if (input.checked) setKey(data, input.name, _getInputValue(input));
      } else if (input.type === 'checkbox') {
        setKey(data, input.name, 'model' in input ? _getInputModel(input) : input.checked);
      } else {
        setKey(data, input.name, _getInputValue(input));
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

  function runListeners(listeners, args, this_arg) {
    for (var i = 0, n = listeners.length; i < n; i++) {
      listeners[i].apply(this_arg, args);
    }
  }

  function formBind(form, onSubmit, options) {
    options = options || {};

    if (!(onSubmit instanceof Function)) {
      options = onSubmit || options;
      onSubmit = _noop;
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
        if (listeners[event_name]) _remove(listeners[event_name], listener);else form.removeEventListener(event_name, listener, use_capture);
        return instance;
      }
    };

    _defineProperty(instance, 'data', function () {
      if (options.processParams) {
        return options.processParams(formData(form));
      }

      return formData(form);
    });

    return instance;
  }

  /* global navigator */
  // https://developer.mozilla.org/en-US/docs/Learn/HTML/Forms/HTML5_updates#Constraint_Validation_API
  // https://developer.mozilla.org/es/docs/Web/API/ValidityState
  // not working:
  // 'CustomEvent' in window => function (event_name, node) {
  //   node.dispatchEvent( new CustomEvent(event_name) );
  // }

  var _emitEvent = document.createEvent ? function (node, event_name) {
    var event = document.createEvent('HTMLEvents');
    event.initEvent(event_name, true, true);
    node.dispatchEvent(event);
  } : function (node, event_name) {
    node.fireEvent('on' + event_name, document.createEventObject());
  };

  function getValidityError(validity) {
    for (var key in validity) {
      if (validity[key]) return key.replace(/([a-z])([A-Z])/g, function (_matched, a, b) {
        return a + '_' + b.toLowerCase();
      });
    }

    return 'invalid';
  }

  function runListeners$1(listeners, args, this_arg) {
    for (var i = 0, n = listeners.length; i < n; i++) {
      listeners[i].apply(this_arg, args);
    }
  }

  function setInputAttributes(component, attrs) {
    for (var key in attrs) {
      component.attr(key, attrs[key]);
    }
  }

  function initInput(input, options) {
    options = options || {};
    var previous_value = input.value,
        mask_filled = null,
        custom_error = null,
        error_key = null,
        validation_message = '',
        listeners = {
      change: []
    };
    if (!input.hasAttribute('type')) input.setAttribute('type', options.type || (options.number ? 'tel' : 'text'));

    var _inputMask = options.mask instanceof Function ? options.mask : null,
        plainValue = options.plain ? function (value) {
      return _inputMask(value).plain;
    } : function (value) {
      return value;
    };

    var applyMask = _inputMask ? function () {
      var result;

      try {
        result = _inputMask(input.value, previous_value);
      } catch (err) {
        if (typeof err === 'string') return err;
        throw err;
      }

      if (!result && result !== '') return;

      if ('value' in result) {
        input.value = result.value;
        mask_filled = result.filled;
        if (result.expected && options.onExpected instanceof Function) options.onExpected(result.expected, result);
      } else {
        input.value = result;
        mask_filled = false;
      }
    } : _noop;

    function getErrorKey() {
      input.setCustomValidity('');
      validation_message = input.validationMessage;
      if (custom_error) return custom_error;

      if (input.value) {
        return options.customError && options.customError(plainValue(input.value), mask_filled, input.value) || input.validity && !input.validity.valid && getValidityError(input.validity) || _inputMask && !mask_filled && mask_filled !== null && 'uncomplete';
      } else if (input.hasAttribute('required')) return 'required';
    }

    if (options.onChange instanceof Function) listeners.change.push(options.onChange);

    function checkValidity(_custom_error) {
      var previous_error_key = error_key;
      if (_custom_error) custom_error = _custom_error;
      error_key = getErrorKey();
      var custom_error_message = options.getErrorMessage && options.getErrorMessage(error_key);
      if (custom_error_message) input.setCustomValidity(custom_error_message);

      if (input.value !== previous_value || error_key !== previous_error_key) {
        runListeners$1(listeners.change, [plainValue(input.value), mask_filled, error_key, previous_value, custom_error_message || validation_message], input);
      }
    }

    setTimeout(checkValidity, 0);

    function onInput() {
      var mask_error = applyMask();
      if (input.value === previous_value) return;
      previous_value = input.value;
      custom_error = null;
      checkValidity(mask_error);

      _emitEvent(input, 'model');
    }

    input.addEventListener(is_android ? 'keyup' : 'input', onInput, options.use_capture);
    input.addEventListener('change', onInput, options.use_capture);
    input.addEventListener('blur', onInput, options.use_capture);
    var component = {
      input: input,
      focus: function focus() {
        return input.focus();
      },
      setCustomValidity: function setCustomValidity(message) {
        input.setCustomValidity(message); // custom_error = 'custom';
        // checkValidity();

        return component;
      },
      setError: function setError(_error_key) {
        checkValidity(_error_key);
        return component;
      },
      setRequired: function setRequired(required) {
        custom_error = null;

        if (required) {
          input.setAttribute('required', '');
        } else if (input.hasAttribute('required')) {
          input.removeAttribute('required');
        }

        checkValidity();
        return component;
      },
      attr: function attr(key, value) {
        if (value === undefined) return input.getAttribute(key);else if (value === null) input.removeAttribute(key);else input.setAttribute(key, value);
        checkValidity();
        return component;
      },
      on: function on(event_name, listener, use_capture) {
        if (listeners[event_name]) listeners[event_name].push(listener);else input.addEventListener(event_name, listener, use_capture);
        return component;
      },
      off: function off(event_name, listener, use_capture) {
        if (listeners[event_name]) _remove(listeners[event_name], listener);else input.removeEventListener(event_name, listener, use_capture);
        return component;
      },
      checkValidity: checkValidity,
      unbind: function unbind() {
        input.removeEventListener(is_android ? 'keyup' : 'input', onInput, options.use_capture);
        input.removeEventListener('blur', onInput, options.use_capture);
        input.removeEventListener('change', onInput, options.use_capture);
        return component;
      }
    };

    _defineProperty(component, 'value', function () {
      return plainValue(input.value);
    }, function (value) {
      previous_value = '';
      input.value = value || '';
      previous_value = input.value;
      onInput();
    });

    _defineProperty(component, 'filled', function () {
      return mask_filled;
    });

    _defineProperty(component, 'valid', function () {
      return !error_key;
    });

    _defineProperty(component, 'model', options.toModel ? function () {
      return options.toModel(plainValue(input.value));
    } : options.number ? function () {
      return Number(plainValue(input.value));
    } : function () {
      return plainValue(input.value);
    }, options.fromModel ? function (model) {
      component.value = options.fromModel(model);
    } : function (model) {
      component.value = model;
    });

    if (options.bind_model !== false) {
      _defineProperty(input, 'model', function () {
        return component.model;
      }, function (model) {
        component.model = model;
      });

      _defineProperty(input, 'is_filled', function () {
        return mask_filled;
      });
    }

    _defineProperty(component, 'is_required', function () {
      return input.hasAttribute('required');
    });

    if (options.value) {
      component.setAttribute('value', options.value);
      previous_value = options.value;
    }

    if (options.attrs) setInputAttributes(component, options.attrs);
    onInput();
    return component;
  }

  function inputEnv(_env, createMask) {
    var formats = {},
        env = _env || {},
        error_messages = null;

    env.defineFormat = function (format_name, format_options) {
      var new_format = Object.create(typeof format_options === 'string' ? {
        mask: format_options
      } : format_options);
      if (createMask instanceof Function && typeof format_options.mask === 'string') new_format.mask = createMask(format_options.mask);else if (new_format.mask instanceof Function) new_format.mask = format_options.mask;else if (new_format.mask) throw new Error('mask should be a Function');
      formats[format_name] = new_format;
    };

    env.setErrorMessages = function (format_name, messages) {
      if (!format_name) return;
      if (messages === undefined) error_messages = format_name;else error_messages[format_name] = messages;
    };

    env.getErrorMessages = function (format_name) {
      if (!error_messages) return null;
      return error_messages[format_name] || error_messages.default || null;
    };

    env.getFormat = function (format_name) {
      var format = Object.create(formats[format_name] || {});

      format.getErrorMessages = function () {
        return env.getErrorMessages(format_name);
      };

      return format;
    };

    env.createMask = createMask;
    env.getData = formData;
    env.enable = enableInputs;
    env.disable = disableInputs;
    env.setReadonly = readonlyInputs;
    env.setEditable = editableInputs;
    return env;
  }

  var _push = Array.prototype.push;
  var filters = {
    up: function up(value) {
      return value.toUpperCase();
    },
    lo: function lo(value) {
      return value.toLowerCase();
    }
  };

  function _noopValue(value) {
    return value;
  }

  var number_RE = {};

  function _getNumberRE(num) {
    if (!number_RE[num]) {
      number_RE[num] = new RegExp('[0-' + num + ']');
      number_RE[num].filterStr = _noopValue;
    }

    return number_RE[num];
  }

  function inputMask(pattern) {
    var aux_parts, aux_re;
    var tokens = pattern.split(/{(.*?)}/).reduce(function (tokens, token, i) {
      if (i % 2) {
        if (/^\d$/.test(token)) {
          tokens.push(_getNumberRE(token));
        } else if (/^\w+:/.test(token)) {
          aux_parts = token.split(/:(.+)/);
          aux_re = new RegExp('[' + aux_parts[1] + ']');
          aux_re.filterStr = filters[aux_parts[0]];
          if (!aux_re.filterStr) throw new Error('filter \'' + aux_parts[0] + '\' not defined');
          tokens.push(aux_re);
        }
      } else if (token !== '') _push.apply(tokens, token.split(''));

      return tokens;
    }, []);
    return function (value, previous_value, _cursor_position) {
      var letters = value.split(''),
          result_no_tail = '',
          result = '',
          plain = '',
          is_deleting = false;
      if (!value) return {
        value: '',
        plain: '',
        filled: false
      };
      if (typeof previous_value === 'string' && previous_value.indexOf(value) === 0) is_deleting = true;

      for (var i = 0, t = 0, n = letters.length, letter, token; i < n; i++) {
        letter = letters[i];
        token = tokens[t++];

        while (typeof token === 'string') {
          result += token;
          if ((i || i === t - 1) && token === letter) letter = letters[++i];
          token = tokens[t++];
        }

        if (!token || letter === undefined) break;
        letter = token.filterStr(letter);

        if (token.test(letter)) {
          result += letter;
          result_no_tail = result;
          plain += letter;
        } else return {
          expected: {
            index: i,
            match: token.source.replace(/^\[|\]$/g, '')
          },
          value: is_deleting ? result_no_tail : result,
          plain: plain,
          filled: false
        };
      }

      token = tokens[t++];

      while (typeof token === 'string') {
        result += token;
        token = tokens[t++];
      }

      if (is_deleting && result.length > result_no_tail.length) value = result_no_tail.substr(0, result_no_tail.length - 1);else value = result;
      return {
        value: value,
        plain: is_deleting ? plain.substr(0, plain.length - 1) : plain,
        filled: value.length === tokens.length
      };
    };
  }

  var bundle = inputEnv(formBind, inputMask);
  bundle.initInput = initInput;

  return bundle;

})));
