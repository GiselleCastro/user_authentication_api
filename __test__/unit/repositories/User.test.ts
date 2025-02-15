import { createTracker, MockClient, Tracker } from 'knex-mock-client';
import { db } from '../../../src/database/knex';
import { faker } from '@faker-js/faker';
import { UserRepository } from '../../../src/repositories/User';
import { UnprocessableEntityError } from '../../../src/config/BaseError';
import { UUID } from '../../../src/@types';

jest.mock('../../../src/database/knex', () => {
  const knex = require('knex');
  return {
    db: knex({ client: MockClient }),
  };
});

describe('UserRepository', () => {
  let tracker: Tracker;

  beforeAll(() => {
    tracker = createTracker(db);
  });

  afterEach(() => {
    tracker.reset();
    tracker.resetHandlers();
  });

  describe('createUser', () => {
    it('User created successfully', async () => {
      const username = faker.person.firstName();
      const email = faker.internet.email();
      const passwordHash = faker.string.alphanumeric(10);

      tracker.on.insert('users').response(undefined);

      const data = await new UserRepository().createUser(username, email, passwordHash);

      const insertHistory = tracker.history.insert;

      expect(data).toBeUndefined();
      expect(insertHistory).toHaveLength(1);
      expect(insertHistory[0].method).toBe('insert');
      expect(insertHistory[0].bindings[0]).toBe(email);
      expect(insertHistory[0].bindings[2]).toBe(passwordHash);
      expect(insertHistory[0].bindings[3]).toBe(username);
    });

    it('should return error if not insert user data into table', async () => {
      const username = faker.person.firstName();
      const email = faker.internet.email();
      const passwordHash = faker.string.alphanumeric(10);

      tracker.on.insert('users').simulateError('Connection lost');

      await expect(
        new UserRepository().createUser(username, email, passwordHash),
      ).rejects.toBeInstanceOf(UnprocessableEntityError);
    });
  });

  describe('getUserById', () => {
    it('User by id found successfully', async () => {
      const userId = faker.string.uuid() as unknown as UUID;
      const email = faker.internet.email();
      const passwordHash = faker.string.alphanumeric(10);

      tracker.on.select('users').response([{ id: userId, email, passwordHash }]);

      const data = await new UserRepository().getUserById(userId);

      const selectHistory = tracker.history.select;

      expect(data).toEqual({
        id: userId,
        email,
        passwordHash,
      });

      expect(selectHistory[0].method).toBe('select');
    });

    it('should return error if it cannot find user by id', async () => {
      const userId = faker.string.uuid() as unknown as UUID;

      tracker.on.select('users').simulateError('Connection lost');

      await expect(new UserRepository().getUserById(userId)).rejects.toBeInstanceOf(
        UnprocessableEntityError,
      );
    });
  });

  describe('getUserByLogin', () => {
    it('User found successfully', async () => {
      const userId = faker.string.uuid() as unknown as UUID;
      const username = faker.person.firstName();
      const confirmed = faker.datatype.boolean();
      const email = faker.internet.email();
      const passwordHash = faker.string.alphanumeric(10);

      tracker.on
        .select('users')
        .response([{ id: userId, username, email, confirmed, passwordHash }]);

      const data = await new UserRepository().getUserByLogin(username);

      const selectHistory = tracker.history.select;

      expect(data).toEqual({
        id: userId,
        username,
        email,
        confirmed,
        passwordHash,
      });

      expect(selectHistory[0].method).toBe('select');
    });

    it('should return error if it cannot find user by login', async () => {
      const username = faker.person.firstName();

      tracker.on.select('users').simulateError('Connection lost');

      await expect(new UserRepository().getUserByLogin(username)).rejects.toBeInstanceOf(
        UnprocessableEntityError,
      );
    });
  });

  describe('getUserByUsernameOrEmail', () => {
    it('User found successfully', async () => {
      const username = faker.person.firstName();
      const confirmed = faker.datatype.boolean();
      const email = faker.internet.email();

      tracker.on.select('users').response([{ username, email, confirmed }]);

      const data = await new UserRepository().getUserByUsernameOrEmail(username, email);

      const selectHistory = tracker.history.select;

      expect(data).toEqual({ username, email, confirmed });

      expect(selectHistory[0].method).toBe('select');
    });

    it('should return error if it cannot find user by username or email', async () => {
      const username = faker.person.firstName();
      const email = faker.internet.email();

      tracker.on.select('users').simulateError('Connection lost');

      await expect(
        new UserRepository().getUserByUsernameOrEmail(username, email),
      ).rejects.toBeInstanceOf(UnprocessableEntityError);
    });
  });

  describe('deleteUser', () => {
    it('User deleted successfully', async () => {
      const userId = faker.string.uuid() as unknown as UUID;

      tracker.on.delete('users').response(1);

      const data = await new UserRepository().deleteUser(userId);

      const deleteHistory = tracker.history.delete;

      expect(data).toBe(1);

      expect(deleteHistory[0].method).toBe('delete');
    });

    it('should return error if it cannot delete user', async () => {
      const userId = faker.string.uuid() as unknown as UUID;

      tracker.on.delete('users').simulateError('Connection lost');

      await expect(new UserRepository().deleteUser(userId)).rejects.toBeInstanceOf(
        UnprocessableEntityError,
      );
    });
  });

  describe('updatePassword', () => {
    it('Password updated successfully', async () => {
      const email = faker.internet.email();
      const passwordHash = faker.string.alphanumeric(10);

      tracker.on.update('users').response([]);

      const data = await new UserRepository().updatePassword(email, passwordHash);

      const updateHistory = tracker.history.update;

      expect(data).toEqual([]);
      expect(updateHistory[0].method).toBe('update');
    });

    it('should return error if it cannot update password', async () => {
      const email = faker.internet.email();
      const passwordHash = faker.string.alphanumeric(10);

      tracker.on.update('users').simulateError('Connection lost');

      await expect(
        new UserRepository().updatePassword(email, passwordHash),
      ).rejects.toBeInstanceOf(UnprocessableEntityError);
    });
  });

  describe('confirmEmail', () => {
    it('Email confirmed successfully', async () => {
      const email = faker.internet.email();

      tracker.on.update('users').response([]);

      const data = await new UserRepository().confirmEmail(email);

      const updateHistory = tracker.history.update;

      expect(data).toEqual([]);
      expect(updateHistory[0].method).toBe('update');
    });

    it('should return error if it cannot confirm email', async () => {
      const email = faker.internet.email();

      tracker.on.update('users').simulateError('Connection lost');

      await expect(new UserRepository().confirmEmail(email)).rejects.toBeInstanceOf(
        UnprocessableEntityError,
      );
    });
  });
});
