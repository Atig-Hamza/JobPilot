import test from 'node:test';
import assert from 'node:assert/strict';

import { getClientIp } from '../../src/utils/getClientIp.js';
import catchAsync from '../../src/utils/catchAsync.js';

test('getClientIp prefers cf-connecting-ip header', () => {
  const req = {
    headers: {
      'cf-connecting-ip': '1.1.1.1',
      'x-real-ip': '2.2.2.2',
      'x-forwarded-for': '3.3.3.3, 4.4.4.4'
    },
    socket: { remoteAddress: '5.5.5.5' }
  };

  assert.equal(getClientIp(req), '1.1.1.1');
});

test('getClientIp strips ::ffff: prefix from remote address', () => {
  const req = {
    headers: {},
    socket: { remoteAddress: '::ffff:127.0.0.1' }
  };

  assert.equal(getClientIp(req), '127.0.0.1');
});

test('catchAsync forwards async errors to next', async () => {
  const expectedError = new Error('boom');
  const wrapped = catchAsync(async () => {
    throw expectedError;
  });

  let receivedError;
  wrapped({}, {}, (err) => {
    receivedError = err;
  });

  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(receivedError, expectedError);
});
