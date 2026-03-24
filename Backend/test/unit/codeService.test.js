import test from 'node:test';
import assert from 'node:assert/strict';

import InviteCode from '../../src/models/inviteCode.js';
import User from '../../src/models/User.js';
import {
  useInviteCode,
  sendCreditsToFriend
} from '../../src/services/codeService.js';

test('useInviteCode records usage and disables code at limit', async () => {
  const originalFindOne = InviteCode.findOne;

  const inviteCode = {
    isValid: true,
    usedby: [],
    avaliblefor: 1,
    saveCalled: false,
    async save() {
      this.saveCalled = true;
    }
  };

  InviteCode.findOne = async () => inviteCode;

  try {
    const result = await useInviteCode('ABC123', 'user-1');
    assert.equal(result, true);
    assert.deepEqual(inviteCode.usedby, ['user-1']);
    assert.equal(inviteCode.isValid, false);
    assert.equal(inviteCode.saveCalled, true);
  } finally {
    InviteCode.findOne = originalFindOne;
  }
});

test('useInviteCode rejects if user already used the code', async () => {
  const originalFindOne = InviteCode.findOne;

  InviteCode.findOne = async () => ({
    isValid: true,
    usedby: ['user-1'],
    avaliblefor: 3,
    async save() {}
  });

  try {
    await assert.rejects(
      () => useInviteCode('ABC123', 'user-1'),
      /Invite code already used by this user/
    );
  } finally {
    InviteCode.findOne = originalFindOne;
  }
});

test('sendCreditsToFriend transfers credits between users', async () => {
  const originalFindById = User.findById;
  const originalFindOne = User.findOne;

  const sender = {
    _id: { equals: () => false },
    fullName: 'Sender User',
    role: 'user',
    credits: 300,
    saveCalled: false,
    async save() {
      this.saveCalled = true;
    }
  };

  const recipient = {
    _id: { equals: () => false },
    fullName: 'Recipient User',
    email: 'friend@example.com',
    credits: 50,
    saveCalled: false,
    async save() {
      this.saveCalled = true;
    }
  };

  User.findById = async () => sender;
  User.findOne = async () => recipient;

  try {
    const result = await sendCreditsToFriend('sender-1', 'friend@example.com', 100);

    assert.equal(sender.credits, 200);
    assert.equal(recipient.credits, 150);
    assert.equal(sender.saveCalled, true);
    assert.equal(recipient.saveCalled, true);
    assert.equal(result.amount, 100);
    assert.equal(result.sender.newBalance, 200);
    assert.equal(result.recipient.newBalance, 150);
  } finally {
    User.findById = originalFindById;
    User.findOne = originalFindOne;
  }
});

test('sendCreditsToFriend rejects transfer above 500 for non-admin', async () => {
  const originalFindById = User.findById;

  User.findById = async () => ({
    role: 'user',
    credits: 1000,
    async save() {}
  });

  try {
    await assert.rejects(
      () => sendCreditsToFriend('sender-1', 'friend@example.com', 600),
      /Maximum transfer limit is 500 credits/
    );
  } finally {
    User.findById = originalFindById;
  }
});
