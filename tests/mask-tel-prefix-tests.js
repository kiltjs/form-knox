/* global describe, it */

import assert from 'assert';
import inputMask from '../src/mask';

describe('tel prefix', function () {

  var tel = inputMask('+34 {9}{9}{9} {9}{9}{9} {9}{9}{9}');

  it('should return empty telephone (empty input)', function () {

    assert.strictEqual( tel('').value, '+34 ' );

  });

  it('should return formatted telephone (flat input)', function () {

    assert.strictEqual( tel('123456789').value, '+34 123 456 789' );
    assert.strictEqual( tel('123456789').filled, true, 'filled' );

  });

  it('should return formatted telephone (formatted input)', function () {

    assert.strictEqual( tel('123 456 789').value, '+34 123 456 789' );
    assert.strictEqual( tel('123 456 789').filled, true, 'filled' );

  });

  it('should return partial formatted telephone (partial input)', function () {

    assert.strictEqual( tel('123').value, '+34 123 ' );

  });

  it('should remove last separator (input + previousInput)', function () {

    assert.strictEqual( tel('123', '123 ').value, '+34 12' );
    assert.strictEqual( tel('123 456', '123 456 ').value, '+34 123 45' );

  });

});
