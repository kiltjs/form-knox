'use strict';

var matchValues = /{([a-z]+:)?[\w-]+}/g,
    matchParts = /{(([a-z]+):)?([\w-]+)}/;

var filterers = {
  up: function (value) { return value.toUpperCase(); },
  lo: function (value) { return value.toLowerCase(); }
};

function inputMask (pattern) {
  var matchDigit = /\d/,
      markSeparators = pattern.split(matchValues).filter( function (_v, i) { return !(i%2); }),
      patterns = pattern.match(matchValues).map(function (brackets) {
        if( brackets === '{9}' ) return matchDigit;
        var matches = brackets.match(matchParts);
        var pat = new RegExp('[' + matches[3] + ']');
        if( matches[2] ) {
          return {
            filter: filterers[matches[2]],
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

module.exports = inputMask;
