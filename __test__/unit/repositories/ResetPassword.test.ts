import { createTracker, MockClient, Tracker } from "knex-mock-client";
import { db } from "../../../src/database/knex";
import { faker } from "@faker-js/faker";
import { ResetPasswordRepository } from "../../../src/repositories/ResetPassword";
import { UnprocessableEntityError } from "../../../src/config/BaseError";
import { UUID } from "../../../src/@types";

jest.mock("../../../src/database/knex", () => {
  const knex = require("knex");
  return {
    db: knex({ client: MockClient }),
  };
});

describe("ResetPasswordRepository", () => {
  let tracker: Tracker;

  beforeAll(() => {
    tracker = createTracker(db);
  });

  afterEach(() => {
    tracker.reset();
    tracker.resetHandlers();
  });

  describe("saveToken", () => {
    it("Token created successfully", async () => {
      const userId = faker.string.uuid() as unknown as UUID;
      const login = faker.string.alphanumeric(6);
      const token = faker.string.alphanumeric(10);

      tracker.on.insert("password_resets").response(undefined);

      const data = await new ResetPasswordRepository().saveToken(
        userId,
        login,
        token,
      );

      const insertHistory = tracker.history.insert;

      expect(data).toBeUndefined();
      expect(insertHistory).toHaveLength(1);
      expect(insertHistory[0].method).toBe("insert");
      expect(insertHistory[0].bindings[0]).toBe(login);
      expect(insertHistory[0].bindings[1]).toBe(token);
      expect(insertHistory[0].bindings[2]).toBe(userId);
    });

    it("should return error if not insert info into table", async () => {
      const userId = faker.string.uuid() as unknown as UUID;
      const login = faker.string.alphanumeric(6);
      const token = faker.string.alphanumeric(10);

      tracker.on.insert("password_resets").simulateError("Connection lost");

      await expect(
        new ResetPasswordRepository().saveToken(userId, login, token),
      ).rejects.toBeInstanceOf(UnprocessableEntityError);
    });
  });

  describe("getTokenAndLoginByUserId", () => {
    it("Token and login found successfully", async () => {
      const userId = faker.string.uuid() as unknown as UUID;
      const token = faker.string.alphanumeric(10);

      tracker.on.select("password_resets").response([
        {
          user_id: userId,
          token,
        },
      ]);

      const data = await new ResetPasswordRepository().getTokenAndLoginByUserId(
        userId,
      );

      const selectHistory = tracker.history.select;

      expect(data).toEqual({
        user_id: userId,
        token,
      });

      expect(selectHistory[0].method).toEqual("select");
    });

    it("should return error if it cannot find token and login by user id", async () => {
      const userId = faker.string.uuid() as unknown as UUID;

      tracker.on.select("password_resets").simulateError("Connection lost");

      await expect(
        new ResetPasswordRepository().getTokenAndLoginByUserId(userId),
      ).rejects.toBeInstanceOf(UnprocessableEntityError);
    });
  });

  describe("deleteToken", () => {
    it("Token deleted successfully", async () => {
      const userId = faker.string.uuid() as unknown as UUID;

      tracker.on.delete("password_resets").response(1);

      const data = await new ResetPasswordRepository().deleteToken(userId);

      const deleteHistory = tracker.history.delete;

      expect(data).toBe(1);

      expect(deleteHistory[0].method).toEqual("delete");
    });

    it("should return error if it cannot delete token", async () => {
      const userId = faker.string.uuid() as unknown as UUID;

      tracker.on.delete("password_resets").simulateError("Connection lost");

      await expect(
        new ResetPasswordRepository().deleteToken(userId),
      ).rejects.toBeInstanceOf(UnprocessableEntityError);
    });
  });
});
