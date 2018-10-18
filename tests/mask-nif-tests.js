/* global describe, it */

import assert from 'assert';
import inputMask from '../src/mask';

describe('nif', function () {

  var nif = inputMask('{up:KLMXYZ0-9}{9}{9}{9}{9}{9}{9}{9} {up:A-Z}');

  it('should return empty nif (empty input)', function () {

    assert.strictEqual( nif('').value, '' );

  });

  it('should return formatted nif (flat input lowercase)', function () {

    assert.strictEqual( nif('12345678z').value, '12345678 Z' );
    assert.strictEqual( nif('12345678z').filled, true );

  });

  it('should return formatted nif (flat input)', function () {

    assert.strictEqual( nif('12345678Z').value, '12345678 Z' );
    assert.strictEqual( nif('12345678Z').filled, true );

  });

  it('should return formatted nif (formatted input lowercase)', function () {

    assert.strictEqual( nif('12345678 z').value, '12345678 Z' );
    assert.strictEqual( nif('12345678 z').filled, true );

  });

  it('should return formatted nif (formatted input)', function () {

    assert.strictEqual( nif('12345678 Z').value, '12345678 Z' );
    assert.strictEqual( nif('12345678 Z').filled, true );

  });

  it('should return partial formatted nif (partial input)', function () {

    assert.strictEqual( nif('12345678').value, '12345678 ' );

  });

  it('should remove last separator (input + previousInput)', function () {

    assert.strictEqual( nif('12345678', '12345678 ').value, '1234567', '\'1234567 \'' );
    assert.strictEqual( nif('12345678', '12345678 ').filled, false, 'filled' );

    assert.strictEqual( nif('1234567', '12345678').value, '1234567', '\'1234567\'' );
    assert.strictEqual( nif('1234567', '12345678').filled, false, 'filled' );

  });

});
