
var match_values_RE = /{([a-z]+:)?[\w-]+}/g,
    match_parts_RE = /{(([a-z]+):)?([\w-]+)}/,
    reTest = RegExp.prototype.test;

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

    } else if( token !== '' ) tokens.push(token);

    return tokens;
  }, []);

  // console.log('tokens', pattern, tokens ); // eslint-disable-line

  return function (value, previous_value, _cursor_position) {
    var letters = value.split(''),
        result_no_tail = '',
        result = '',
        plain = '',
        is_deleting = false;

    if( typeof previous_value === 'string' && previous_value.indexOf(value) === 0 ) is_deleting = true;

    for( var i = 0, t = 0, n = letters.length, letter, token ; i < n ; i++ ) {
      letter = letters[i];
      token = tokens[t++];

      while( typeof token === 'string' ) {
        // console.log(`(while) letter: '${letter}', token: '${token}'`); // eslint-disable-line
        result += token;
        if( token === letter ) letter = letters[++i];
        token = tokens[t++];
      }

      // console.log(`letter: '${letter}', token: '${token}'`); // eslint-disable-line

      // if( typeof token === 'string' ) {
      //
      //   // if( letter === token ) result += letter;
      //   // else return {
      //   //   expected: token,
      //   //   value: result,
      //   //   plain: plain,
      //   //   filled: t === tokens.length,
      //   // };
      // } else

      if( !token ) {
        break;
      }

      letter = token.filterStr(letter);

      if( token.test( letter ) ) {
        result += letter;
        result_no_tail = result;
        plain += letter;
      } else return {
        expected: token,
        value: result,
        plain: plain,
        filled: t === tokens.length,
      };
    }

    if( is_deleting ) {
      result = result_no_tail;
    } else {
      token = tokens[t++];
      while( typeof token === 'string' ) {
        result += token;
        token = tokens[t++];
      }
    }

    // if( previous_value && value.length < previous_value.length ) {
    //   return {
    //     value: previous_value.substr(-1) === tokens[t][0] ? result.substr(0, result.length - 1) : result,
    //     plain: previous_value.substr(-1) === tokens[t][0] ? plain.substr(0, plain.length - 1) : plain,
    //     filled: t === tokens.length,
    //   };
    // }

    return {
      value: is_deleting ? result.substr(0, result.length - 1) : result,
      filled: t === tokens.length + 1,
      plain: plain,
    };
  };
}

// eslint-disable-next-line
function _inputMask (pattern) {
  var mark_separators = pattern.split(match_values_RE).filter( function (_v, i) { return !(i%2); }),
      patterns = pattern.match(match_values_RE).map(function (brackets) {
        if( /{\d}/.test(brackets) ) return new RegExp('[0-' + brackets[1] + ']');

        var matches = brackets.match(match_parts_RE);
        var pat = new RegExp('[' + matches[3] + ']');

        if( matches[2] ) {
          return {
            filter: filters[matches[2]],
            test: reTest.bind(pat),
          };
        }

        return pat;
      });

  function mask (value, previous_value) {
    var separators = mark_separators.slice(),
        result = '',
        plain = '',
        letters = value.split(''),
        i, n, letter,
        p = 0;

    for( i = 0, n = letters.length; i < n ; i++ ) {
      if( !patterns[p] ) return { value: result, plain: plain, filled: true };
      letter = patterns[p].filter ? patterns[p].filter(letters[i]) : letters[i];

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
}
