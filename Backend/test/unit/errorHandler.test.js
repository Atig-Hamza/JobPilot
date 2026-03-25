import test from 'node:test';
import assert from 'node:assert/strict';

import errorHandler from '../../src/middlewares/errorHandler.js';
import { AppError } from '../../src/utils/AppError.js';

function createRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

test('errorHandler returns detailed error in development mode', () => {
  const prev = process.env.NODE_ENV;
  process.env.NODE_ENV = 'development';

  try {
    const err = new AppError('Bad input', 400);
    const res = createRes();

    errorHandler(err, {}, res, () => {});

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.status, 'fail');
    assert.equal(res.body.message, 'Bad input');
    assert.ok(res.body.stack);
  } finally {
    process.env.NODE_ENV = prev;
  }
});

test('errorHandler returns operational error in production mode', () => {
  const prev = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';

  try {
    const err = new AppError('Unauthorized', 401);
    const res = createRes();

    errorHandler(err, {}, res, () => {});

    assert.equal(res.statusCode, 401);
    assert.equal(res.body.status, 'fail');
    assert.equal(res.body.message, 'Unauthorized');
  } finally {
    process.env.NODE_ENV = prev;
  }
});

test('errorHandler hides internal details for non-operational errors in production mode', () => {
  const prev = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    const err = new Error('Unexpected crash');
    const res = createRes();

    errorHandler(err, {}, res, () => {});

    assert.equal(res.statusCode, 500);
    assert.equal(res.body.status, 'error');
    assert.equal(res.body.message, 'Something went very wrong!');
    assert.equal(res.body.devError, 'Unexpected crash');
  } finally {
    console.error = originalConsoleError;
    process.env.NODE_ENV = prev;
  }
});
