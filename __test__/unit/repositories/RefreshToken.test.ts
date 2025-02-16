import { createTracker, MockClient, Tracker } from 'knex-mock-client';
import { db } from '../../../src/database/knex';
import { faker } from '@faker-js/faker';
import { RefreshTokenRepository } from '../../../src/repositories/RefreshToken';
import { UnprocessableEntityError } from '../../../src/config/BaseError';
import { UUID } from '../../../src/@types';

jest.mock('../../../src/database/knex', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const knex = require('knex');
  return {
    db: knex({ client: MockClient }),
  };
});

describe('RefreshTokenRepository', () => {
  let tracker: Tracker;

  beforeAll(() => {
    tracker = createTracker(db);
  });

  afterEach(() => {
    tracker.reset();
    tracker.resetHandlers();
  });

  describe('saveResfreshToken', () => {
    it('Refresh Token created successfully', async () => {
      const refreshTokenId = faker.string.uuid() as unknown as UUID;
      const userId = faker.string.uuid() as unknown as UUID;
      const refreshTokenHash = faker.string.alphanumeric(10);
      const expiresInRefreshToken = faker.date.future().toISOString();

      tracker.on.insert('refresh_tokens').response(undefined);

      const data = await new RefreshTokenRepository().saveResfreshToken(
        refreshTokenId,
        userId,
        refreshTokenHash,
        expiresInRefreshToken,
      );

      const insertHistory = tracker.history.insert;

      expect(data).toBeUndefined();
      expect(insertHistory).toHaveLength(1);
      expect(insertHistory[0].method).toBe('insert');
      expect(insertHistory[0].bindings[0]).toBe(expiresInRefreshToken);
      expect(insertHistory[0].bindings[1]).toBe(refreshTokenId);
      expect(insertHistory[0].bindings[2]).toBe(refreshTokenHash);
      expect(insertHistory[0].bindings[3]).toBe(userId);
    });

    it('should return error if not insert refresh token into table', async () => {
      const refreshTokenId = faker.string.uuid() as unknown as UUID;
      const userId = faker.string.uuid() as unknown as UUID;
      const refreshTokenHash = faker.string.alphanumeric(10);
      const expiresInRefreshToken = faker.date.future().toISOString();

      tracker.on.insert('refresh_tokens').simulateError('Connection lost');

      await expect(
        new RefreshTokenRepository().saveResfreshToken(
          refreshTokenId,
          userId,
          refreshTokenHash,
          expiresInRefreshToken,
        ),
      ).rejects.toBeInstanceOf(UnprocessableEntityError);
    });
  });

  describe('getRefreshTokenById', () => {
    it('Refresh token by id found successfully', async () => {
      const refreshTokenId = faker.string.uuid() as unknown as UUID;
      const userId = faker.string.uuid() as unknown as UUID;
      const refreshTokenHash = faker.string.alphanumeric(10);
      const expiresInRefreshToken = faker.date.future().toISOString();

      tracker.on.select('refresh_tokens').response([
        {
          id: refreshTokenId,
          user_id: userId,
          refresh_token_hash: refreshTokenHash,
          expires_in: expiresInRefreshToken,
        },
      ]);

      const data = await new RefreshTokenRepository().getRefreshTokenById(refreshTokenId);

      const selectHistory = tracker.history.select;

      expect(data).toEqual({
        id: refreshTokenId,
        user_id: userId,
        refresh_token_hash: refreshTokenHash,
        expires_in: expiresInRefreshToken,
      });

      expect(selectHistory[0].method).toEqual('select');
    });

    it('should return error if it cannot find refresh token by id', async () => {
      const userId = faker.string.uuid() as unknown as UUID;

      tracker.on.select('refresh_tokens').simulateError('Connection lost');

      await expect(
        new RefreshTokenRepository().getRefreshTokenById(userId),
      ).rejects.toBeInstanceOf(UnprocessableEntityError);
    });
  });

  describe('getRefreshTokenByUserId', () => {
    it('Refresh token found successfully', async () => {
      const refreshTokenId = faker.string.uuid() as unknown as UUID;
      const userId = faker.string.uuid() as unknown as UUID;
      const refreshTokenHash = faker.string.alphanumeric(10);
      const expiresInRefreshToken = faker.date.future().toISOString();

      tracker.on.select('refresh_tokens').response([
        {
          id: refreshTokenId,
          user_id: userId,
          refresh_token_hash: refreshTokenHash,
          expires_in: expiresInRefreshToken,
        },
      ]);

      const data = await new RefreshTokenRepository().getRefreshTokenByUserId(userId);

      const selectHistory = tracker.history.select;

      expect(data).toEqual({
        id: refreshTokenId,
        user_id: userId,
        refresh_token_hash: refreshTokenHash,
        expires_in: expiresInRefreshToken,
      });

      expect(selectHistory[0].method).toEqual('select');
    });

    it('should return error if it cannot find refresh token by user id', async () => {
      const userId = faker.string.uuid() as unknown as UUID;

      tracker.on.select('refresh_tokens').simulateError('Connection lost');

      await expect(
        new RefreshTokenRepository().getRefreshTokenByUserId(userId),
      ).rejects.toBeInstanceOf(UnprocessableEntityError);
    });
  });

  describe('deleteRefreshTokenByRefreshTokenId', () => {
    it('Refresh token deleted successfully', async () => {
      const refreshTokenId = faker.string.uuid() as unknown as UUID;

      tracker.on.delete('refresh_tokens').response(1);

      const data = await new RefreshTokenRepository().deleteRefreshTokenByRefreshTokenId(
        refreshTokenId,
      );

      const deleteHistory = tracker.history.delete;

      expect(data).toBe(1);

      expect(deleteHistory[0].method).toEqual('delete');
    });

    it('should return error if it cannot delete refresh token', async () => {
      const refreshTokenId = faker.string.uuid() as unknown as UUID;

      tracker.on.delete('refresh_tokens').simulateError('Connection lost');

      await expect(
        new RefreshTokenRepository().deleteRefreshTokenByRefreshTokenId(refreshTokenId),
      ).rejects.toBeInstanceOf(UnprocessableEntityError);
    });
  });
});
