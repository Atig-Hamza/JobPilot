import test from 'node:test';
import assert from 'node:assert/strict';

import History from '../../src/models/history.js';
import User from '../../src/models/User.js';
import {
  getHistoryTitleByUserId,
  updateHistoryEntry,
  getHistoryByRoomId
} from '../../src/services/historyService.js';

test('getHistoryTitleByUserId returns paginated metadata', async () => {
  const originalFind = History.find;
  const originalCountDocuments = History.countDocuments;

  const fakeHistory = [{ title: 'A' }, { title: 'B' }];

  History.find = () => ({
    select() {
      return this;
    },
    sort() {
      return this;
    },
    skip() {
      return this;
    },
    async limit() {
      return fakeHistory;
    }
  });

  History.countDocuments = async () => 7;

  try {
    const result = await getHistoryTitleByUserId('user-1', 2, 3);

    assert.deepEqual(result.history, fakeHistory);
    assert.equal(result.total, 7);
    assert.equal(result.totalPages, 3);
    assert.equal(result.currentPage, 2);
  } finally {
    History.find = originalFind;
    History.countDocuments = originalCountDocuments;
  }
});

test('updateHistoryEntry throws when entry does not exist', async () => {
  const originalFindOne = History.findOne;
  History.findOne = async () => null;

  try {
    await assert.rejects(
      () => updateHistoryEntry('h1', 'u1', ['new content']),
      /History entry not found/
    );
  } finally {
    History.findOne = originalFindOne;
  }
});

test('updateHistoryEntry updates content and saves', async () => {
  const originalFindOne = History.findOne;

  const entry = {
    content: ['old'],
    saveCalled: false,
    async save() {
      this.saveCalled = true;
      return this;
    }
  };

  History.findOne = async () => entry;

  try {
    const result = await updateHistoryEntry('h1', 'u1', ['updated']);

    assert.deepEqual(entry.content, ['updated']);
    assert.equal(entry.saveCalled, true);
    assert.equal(result, entry);
  } finally {
    History.findOne = originalFindOne;
  }
});

test('getHistoryByRoomId fetches by roomId only for admin users', async () => {
  const originalUserFindOne = User.findOne;
  const originalHistoryFindOne = History.findOne;

  let capturedQuery = null;

  User.findOne = async () => ({ role: 'admin' });
  History.findOne = async (query) => {
    capturedQuery = query;
    return { roomId: 'room-1' };
  };

  try {
    const result = await getHistoryByRoomId('u1', 'room-1');

    assert.deepEqual(capturedQuery, { roomId: 'room-1' });
    assert.equal(result.roomId, 'room-1');
  } finally {
    User.findOne = originalUserFindOne;
    History.findOne = originalHistoryFindOne;
  }
});

test('getHistoryByRoomId restricts query to user for non-admin users', async () => {
  const originalUserFindOne = User.findOne;
  const originalHistoryFindOne = History.findOne;

  let capturedQuery = null;

  User.findOne = async () => ({ role: 'user' });
  History.findOne = async (query) => {
    capturedQuery = query;
    return { roomId: 'room-1', userId: 'u2' };
  };

  try {
    await getHistoryByRoomId('u2', 'room-1');

    assert.deepEqual(capturedQuery, { userId: 'u2', roomId: 'room-1' });
  } finally {
    User.findOne = originalUserFindOne;
    History.findOne = originalHistoryFindOne;
  }
});
