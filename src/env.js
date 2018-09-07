
import {formData, enableInputs, disableInputs, readonlyInputs, editableInputs} from './form-helpers';

export default function inputEnv (_env, createMask) {
  var formats = {},
      env = _env || {},
      error_messages = null;

  env.defineFormat = function (format_name, format_options) {
    var new_format = Object.create( typeof format_options === 'string' ? { mask: format_options } : format_options );

    if( createMask instanceof Function && typeof format_options.mask === 'string' ) new_format.mask = createMask(format_options.mask);
    else if( new_format.mask instanceof Function ) new_format.mask = format_options.mask;
    else if( new_format.mask ) throw new Error('mask should be a Function');

    formats[format_name] = new_format;
  };

  env.setErrorMessages = function (format_name, messages) {
    if( !format_name ) return;

    if( messages === undefined ) error_messages = format_name;
    else error_messages[format_name] = messages;
  };

  env.getErrorMessages = function (format_name) {
    if( !error_messages ) return null;
    return error_messages[format_name] || error_messages.default || null;
  };

  env.getFormat = function (format_name) {
    var format = Object.create( formats[format_name] || {} );
    format.getErrorMessages = function () {
      return env.getErrorMessages(format_name);
    };
    return format;
  };

  env.createMask = createMask;
  env.getParams = formData;

  env.enable = enableInputs;
  env.disable = disableInputs;
  env.setReadonly = readonlyInputs;
  env.setEditable = editableInputs;

  return env;
}
