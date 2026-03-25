import test from 'node:test';
import assert from 'node:assert/strict';

import { restrictTo } from '../../src/middlewares/authMiddleware.js';
import { AppError } from '../../src/utils/AppError.js';

test('restrictTo allows users with accepted role', () => {
  const middleware = restrictTo('admin', 'user');
  let calledWithoutError = false;

  middleware({ user: { role: 'admin' } }, {}, (err) => {
    if (!err) calledWithoutError = true;
  });

  assert.equal(calledWithoutError, true);
});

test('restrictTo blocks users without accepted role', () => {
  const middleware = restrictTo('admin');
  let capturedError;

  middleware({ user: { role: 'user' } }, {}, (err) => {
    capturedError = err;
  });

  assert.ok(capturedError instanceof AppError);
  assert.equal(capturedError.statusCode, 403);
  assert.equal(capturedError.message, 'You do not have permission to perform this action');
});
