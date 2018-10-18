
var _push = Array.prototype.push;

var filters = {
  up: function (value) { return value.toUpperCase(); },
  lo: function (value) { return value.toLowerCase(); }
};

function _noopValue (value) { return value; }

var number_RE = {};
function _getNumberRE (num) {
  if( !number_RE[num] ) {
    number_RE[num] = new RegExp('[0-' + num + ']');
    number_RE[num].filterStr = _noopValue;
  }
  return number_RE[num];
}

export default function inputMask (pattern) {
  var aux_parts, aux_re;

  var tokens = pattern.split(/{(.*?)}/).reduce(function (tokens, token, i) {
    if( i%2 ) {
      if( /^\d$/.test(token) ) {
        tokens.push( _getNumberRE(token) );

      } else if( /^\w+:/.test(token) ) {
        aux_parts = token.split(/:(.+)/);
        aux_re = new RegExp('[' + aux_parts[1] + ']');
        aux_re.filterStr = filters[aux_parts[0]];

        if( !aux_re.filterStr ) throw new Error('filter \'' + aux_parts[0] + '\' not defined');

        tokens.push(aux_re);
      }

    } else if( token !== '' ) _push.apply(tokens, token.split(''));

    return tokens;
  }, []);

  return function (value, previous_value, _cursor_position) {
    var letters = value.split(''),
        result_no_tail = '',
        result = '',
        plain = '',
        is_deleting = false;

    if( !value ) return { value: '', plain: '', filled: false };

    if( typeof previous_value === 'string' && previous_value.indexOf(value) === 0 ) is_deleting = true;

    for( var i = 0, t = 0, n = letters.length, letter, token ; i < n ; i++ ) {
      letter = letters[i];
      token = tokens[t++];

      while( typeof token === 'string' ) {
        result += token;
        if( token === letter ) letter = letters[++i];
        token = tokens[t++];
      }

      if( !token ) break;

      letter = token.filterStr(letter);

      if( token.test( letter ) ) {
        result += letter;
        result_no_tail = result;
        plain += letter;
      } else return {
        expected: token,
        value: is_deleting ? result_no_tail : result,
        plain: plain,
        filled: false,
      };
    }

    token = tokens[t++];
    while( typeof token === 'string' ) {
      result += token;
      token = tokens[t++];
    }

    if( is_deleting && result.length > result_no_tail.length ) value = result_no_tail.substr(0, result_no_tail.length - 1);
    else value = result;

    return {
      value: value,
      plain: is_deleting ? plain.substr(0, plain.length - 1) : plain,
      filled: value.length === tokens.length,
    };
  };
}
