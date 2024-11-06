import type { FastifyInstance } from "fastify/types/instance";
import { UserService } from "../../../src/service/User";
import { buildServer } from "../../../server";
import { faker } from "@faker-js/faker/.";
import { BadRequestError } from "../../../src/utils/errors";
import { ERROR_VALIDATION } from "../../../src/utils/messages";
import HttpStatusCode from "http-status-codes";

jest.mock("../../../src/service/User");

describe("POST /register", () => {
  let serverStub: FastifyInstance;

  beforeAll(async () => {
    serverStub = buildServer();
  });

  afterAll(async () => {
    await serverStub.close();
  });

  it("User created successfully", async () => {
    const createUserInput = {
      username: faker.person.firstName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      get confirmPassword() {
        return this.password;
      },
    };

    const createUserServiceSpy = jest
      .spyOn(UserService.prototype, "createUser")
      .mockResolvedValue();

    const response = await serverStub.inject({
      method: "POST",
      url: "/register",
      payload: createUserInput,
    });

    expect(response.statusCode).toBe(HttpStatusCode.CREATED);
    expect(response.body).toBe("");
    expect(createUserServiceSpy).toHaveBeenCalledWith(
      ...Object.values(createUserInput),
    );

    createUserServiceSpy.mockRestore();
  });

  it("Error creating user", async () => {
    const createUserInput = {
      username: faker.person.firstName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      confirmPassword: faker.internet.password(),
    };

    const messageError = "error";
    const createUserServiceSpy = jest
      .spyOn(UserService.prototype, "createUser")
      .mockRejectedValue(new BadRequestError(messageError));

    const response = await serverStub.inject({
      method: "POST",
      url: "/register",
      payload: createUserInput,
    });

    expect(response.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
    expect(response.headers["content-type"]).toBe(
      "application/json; charset=utf-8",
    );
    expect(response.json()).toEqual({ message: messageError });
    expect(createUserServiceSpy).toHaveBeenCalledWith(
      ...Object.values(createUserInput),
    );

    createUserServiceSpy.mockRestore();
  });

  it("Error validation - example: password cannot be empty", async () => {
    const createUserInput = {
      username: faker.person.firstName(),
      email: faker.internet.email(),
      password: "",
      confirmPassword: faker.internet.password(),
    };

    const response = await serverStub.inject({
      method: "POST",
      url: "/register",
      payload: createUserInput,
    });

    expect(response.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
    expect(response.json()).toEqual({
      details: ["String must contain at least 1 character(s)"],
      message: ERROR_VALIDATION,
    });
  });
});