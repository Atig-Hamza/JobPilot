import test from 'node:test';
import assert from 'node:assert/strict';

import Profile from '../../src/models/profile.js';
import {
  getProfileByUserId,
  createOrUpdateProfile
} from '../../src/services/profileService.js';

test('getProfileByUserId delegates to Profile.findOne', async () => {
  const originalFindOne = Profile.findOne;
  const fakeProfile = { userId: 'u1', headline: 'Developer' };
  let capturedQuery = null;

  Profile.findOne = async (query) => {
    capturedQuery = query;
    return fakeProfile;
  };

  try {
    const result = await getProfileByUserId('u1');

    assert.deepEqual(capturedQuery, { userId: 'u1' });
    assert.equal(result, fakeProfile);
  } finally {
    Profile.findOne = originalFindOne;
  }
});

test('createOrUpdateProfile updates existing profile and saves', async () => {
  const originalFindOne = Profile.findOne;

  const profile = {
    title: 'Old title',
    city: 'Old city',
    saveCalled: false,
    async save() {
      this.saveCalled = true;
      return this;
    }
  };

  Profile.findOne = async () => profile;

  try {
    const result = await createOrUpdateProfile('u1', {
      title: 'New title',
      city: 'Casablanca'
    });

    assert.equal(profile.title, 'New title');
    assert.equal(profile.city, 'Casablanca');
    assert.equal(profile.saveCalled, true);
    assert.equal(result, profile);
  } finally {
    Profile.findOne = originalFindOne;
  }
});
