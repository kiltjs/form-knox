"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = inputMask;
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
    number_RE[num] = new RegExp('[' + (num === '9' ? '0-' : '') + num + ']');
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
      } else {
        aux_re = new RegExp('[' + token + ']');
        aux_re.filterStr = _noopValue;
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
        delete_last_token = false;
    if (!value) return {
      value: '',
      plain: '',
      filled: false
    };
    if (typeof previous_value === 'string' && previous_value.indexOf(value) === 0 && typeof tokens[previous_value.length - 1] === 'string') delete_last_token = true; // if( typeof previous_value === 'string' && previous_value.indexOf(value) === 0 ) {
    //   while( typeof tokens[value.length - 1] === 'string' ) {
    //     value = value.substr(0, value.length - 1);
    //   }
    //   return {
    //     value: value,
    //     plain: plain,
    //     filled: false,
    //   };
    // }

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
          index: t - 1,
          match: token.source.replace(/^\[|\]$/g, '')
        },
        value: result,
        plain: plain,
        filled: false
      };
    }

    token = tokens[t++];

    while (typeof token === 'string') {
      result += token;
      token = tokens[t++];
    }

    if (delete_last_token) result = result_no_tail.substr(0, result_no_tail.length - 1);
    return {
      value: result,
      plain: delete_last_token ? plain.substr(0, plain.length - 1) : plain,
      filled: result.length === tokens.length
    };
  };
}

module.exports = exports.default;