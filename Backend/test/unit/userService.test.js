import test from 'node:test';
import assert from 'node:assert/strict';

import User from '../../src/models/User.js';
import bcrypt from 'bcryptjs';
import { AppError } from '../../src/utils/AppError.js';
import {
  spendUserCredits,
  updatePassword
} from '../../src/services/userService.js';

test('spendUserCredits deducts credits and saves user', async () => {
  const originalFindById = User.findById;
  const user = {
    credits: 100,
    saveCalled: false,
    async save() {
      this.saveCalled = true;
    }
  };

  User.findById = async () => user;

  try {
    const remaining = await spendUserCredits('u1', 30);
    assert.equal(remaining, 70);
    assert.equal(user.credits, 70);
    assert.equal(user.saveCalled, true);
  } finally {
    User.findById = originalFindById;
  }
});

test('spendUserCredits throws on insufficient balance', async () => {
  const originalFindById = User.findById;
  User.findById = async () => ({ credits: 10, async save() {} });

  try {
    await assert.rejects(
      () => spendUserCredits('u1', 20),
      /Insufficient credits/
    );
  } finally {
    User.findById = originalFindById;
  }
});

test('updatePassword hashes and persists when current password is correct', async () => {
  const originalFindById = User.findById;
  const originalCompare = bcrypt.compare;
  const originalHash = bcrypt.hash;

  const user = {
    password: 'old-hash',
    lastPasswordChange: null,
    saveCalled: false,
    async save() {
      this.saveCalled = true;
    }
  };

  User.findById = () => ({
    select: async () => user
  });
  bcrypt.compare = async () => true;
  bcrypt.hash = async () => 'new-hash';

  try {
    const result = await updatePassword('u1', 'old-pass', 'new-pass');
    assert.equal(result, true);
    assert.equal(user.password, 'new-hash');
    assert.equal(typeof user.lastPasswordChange, 'number');
    assert.equal(user.saveCalled, true);
  } finally {
    User.findById = originalFindById;
    bcrypt.compare = originalCompare;
    bcrypt.hash = originalHash;
  }
});

test('updatePassword throws AppError when current password is invalid', async () => {
  const originalFindById = User.findById;
  const originalCompare = bcrypt.compare;

  const user = {
    password: 'old-hash',
    async save() {}
  };

  User.findById = () => ({
    select: async () => user
  });
  bcrypt.compare = async () => false;

  try {
    await assert.rejects(async () => {
      await updatePassword('u1', 'bad-pass', 'new-pass');
    }, (err) => {
      assert.ok(err instanceof AppError);
      assert.equal(err.statusCode, 401);
      assert.equal(err.message, 'Current password is incorrect');
      return true;
    });
  } finally {
    User.findById = originalFindById;
    bcrypt.compare = originalCompare;
  }
});
