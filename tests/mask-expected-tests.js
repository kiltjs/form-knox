/* global describe, it */

import assert from 'assert';
import inputMask from '../src/mask';

describe('expected', function () {

  it('expected [9]', function () {

    assert.deepEqual( inputMask('{9}')('j').expected, { index: 0, match: '0-9' } );
    assert.deepEqual( inputMask('{9}')('0').expected, undefined );

  });

});
