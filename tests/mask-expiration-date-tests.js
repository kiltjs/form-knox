/* global describe, it */

import assert from 'assert';
import inputMask from '../src/mask';

describe('expected', function () {

  it('expiration time', function () {

    assert.strictEqual( inputMask('{1-1}{012} / {9}{9}')('1').value, '1' );
    assert.strictEqual( inputMask('{1-1}{012} / {9}{9}')('12').value, '12 / ' );
    assert.strictEqual( inputMask('{1-1}{012} / {9}{9}')('12 /', '12 / ').value, '1' );

  });

});
