import test from 'node:test';
import assert from 'node:assert/strict';

import { AppError } from '../../src/utils/AppError.js';

test('AppError sets fail status for 4xx codes', () => {
  const err = new AppError('Invalid request', 400);

  assert.equal(err.message, 'Invalid request');
  assert.equal(err.statusCode, 400);
  assert.equal(err.status, 'fail');
  assert.equal(err.isOperational, true);
});

test('AppError sets error status for 5xx codes', () => {
  const err = new AppError('Server issue', 500);

  assert.equal(err.statusCode, 500);
  assert.equal(err.status, 'error');
  assert.equal(err.isOperational, true);
});
