import { createTracker, MockClient, Tracker } from "knex-mock-client";
import { db } from "../../../src/database/knex";
import { faker } from "@faker-js/faker/.";
import { UserRepository } from "../../../src/repositories/User";
import { UnprocessableEntityError } from "../../../src/utils/errors";
import { UUID } from "../../../src/@types";

jest.mock("../../../src/database/knex", () => {
  const knex = require("knex");
  return {
    db: knex({ client: MockClient }),
  };
});

describe("UserRepository", () => {
  let tracker: Tracker;

  beforeAll(() => {
    tracker = createTracker(db);
  });

  afterEach(() => {
    tracker.reset();
  });

  describe("createUser", () => {
    it("User created successfully", async () => {
      const username = faker.person.firstName();
      const email = faker.internet.email();
      const passwordHash = faker.string.alphanumeric(10);

      tracker.on.insert("users").response(undefined);

      const data = await new UserRepository().createUser(
        username,
        email,
        passwordHash,
      );

      const insertHistory = tracker.history.insert;

      expect(data).toBeUndefined();
      expect(insertHistory).toHaveLength(1);
      expect(insertHistory[0].method).toEqual("insert");
      expect(insertHistory[0].bindings[0]).toEqual(email);
      expect(insertHistory[0].bindings[2]).toEqual(passwordHash);
      expect(insertHistory[0].bindings[3]).toEqual(username);

      tracker.resetHandlers();
    });

    it("Error to create user", async () => {
      const username = faker.person.firstName();
      const email = faker.internet.email();
      const passwordHash = faker.string.alphanumeric(10);

      tracker.on.insert("users").simulateError("Connection lost");

      await expect(
        new UserRepository().createUser(username, email, passwordHash),
      ).rejects.toBeInstanceOf(UnprocessableEntityError);

      tracker.resetHandlers();
    });
  });

  describe("getUserById", () => {
    it("User by id found successfully", async () => {
      const userId = faker.string.uuid() as unknown as UUID;
      const email = faker.internet.email();
      const passwordHash = faker.string.alphanumeric(10);

      tracker.on
        .select("users")
        .response([{ id: userId, email, passwordHash }]);

      const data = await new UserRepository().getUserById(userId);

      const selectHistory = tracker.history.select;

      expect(data).toEqual({
        id: userId,
        email,
        passwordHash,
      });

      expect(selectHistory[0].method).toEqual("select");

      tracker.resetHandlers();
    });

    it("Error to find user by id", async () => {
      const userId = faker.string.uuid() as unknown as UUID;

      tracker.on.select("users").simulateError("Connection lost");

      await expect(
        new UserRepository().getUserById(userId),
      ).rejects.toBeInstanceOf(UnprocessableEntityError);

      tracker.resetHandlers();
    });
  });

  describe("getUserByLogin", () => {
    it("User found successfully", async () => {
      const userId = faker.string.uuid() as unknown as UUID;
      const username = faker.person.firstName();
      const confirmed = faker.datatype.boolean();
      const email = faker.internet.email();
      const passwordHash = faker.string.alphanumeric(10);

      tracker.on
        .select("users")
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

      expect(selectHistory[0].method).toEqual("select");

      tracker.resetHandlers();
    });

    it("Error to find user by login", async () => {
      const username = faker.person.firstName();

      tracker.on.select("users").simulateError("Connection lost");

      await expect(
        new UserRepository().getUserByLogin(username),
      ).rejects.toBeInstanceOf(UnprocessableEntityError);

      tracker.resetHandlers();
    });
  });

  describe("getUserByUsernameOrEmail", () => {
    it("User found successfully", async () => {
      const username = faker.person.firstName();
      const confirmed = faker.datatype.boolean();
      const email = faker.internet.email();

      tracker.on.select("users").response([{ username, email, confirmed }]);

      const data = await new UserRepository().getUserByUsernameOrEmail(
        username,
        email,
      );

      const selectHistory = tracker.history.select;

      expect(data).toEqual({ username, email, confirmed });

      expect(selectHistory[0].method).toEqual("select");

      tracker.resetHandlers();
    });

    it("Error to find user", async () => {
      const username = faker.person.firstName();
      const email = faker.internet.email();

      tracker.on.select("users").simulateError("Connection lost");

      await expect(
        new UserRepository().getUserByUsernameOrEmail(username, email),
      ).rejects.toBeInstanceOf(UnprocessableEntityError);

      tracker.resetHandlers();
    });
  });

  describe("deleteUser", () => {
    it("User deleted successfully", async () => {
      const userId = faker.string.uuid() as unknown as UUID;

      tracker.on.delete("users").response(1);

      const data = await new UserRepository().deleteUser(userId);

      const deleteHistory = tracker.history.delete;

      expect(data).toBe(1);

      expect(deleteHistory[0].method).toEqual("delete");

      tracker.resetHandlers();
    });

    it("Error to delete user by id", async () => {
      const userId = faker.string.uuid() as unknown as UUID;

      tracker.on.delete("users").simulateError("Connection lost");

      await expect(
        new UserRepository().deleteUser(userId),
      ).rejects.toBeInstanceOf(UnprocessableEntityError);

      tracker.resetHandlers();
    });
  });

  describe("updatePassword", () => {
    it("Password updated successfully", async () => {
      const email = faker.internet.email();
      const passwordHash = faker.string.alphanumeric(10);

      tracker.on.update("users").response([]);

      const data = await new UserRepository().updatePassword(
        email,
        passwordHash,
      );

      const updateHistory = tracker.history.update;

      expect(data).toEqual([]);
      expect(updateHistory[0].method).toBe("update");

      tracker.resetHandlers();
    });

    it("Error to update password", async () => {
      const email = faker.internet.email();
      const passwordHash = faker.string.alphanumeric(10);

      tracker.on.update("users").simulateError("Connection lost");

      await expect(
        new UserRepository().updatePassword(email, passwordHash),
      ).rejects.toBeInstanceOf(UnprocessableEntityError);

      tracker.resetHandlers();
    });
  });

  describe("confirmEmail", () => {
    it("Email confirmed successfully", async () => {
      const email = faker.internet.email();

      tracker.on.update("users").response([]);

      const data = await new UserRepository().confirmEmail(email);

      const updateHistory = tracker.history.update;

      expect(data).toEqual([]);
      expect(updateHistory[0].method).toBe("update");

      tracker.resetHandlers();
    });

    it("Error to confirm email", async () => {
      const email = faker.internet.email();

      tracker.on.update("users").simulateError("Connection lost");

      await expect(
        new UserRepository().confirmEmail(email),
      ).rejects.toBeInstanceOf(UnprocessableEntityError);

      tracker.resetHandlers();
    });
  });
});
