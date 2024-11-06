import type { FastifyInstance } from "fastify/types/instance";
import { UserService } from "../../../src/service/User";
import { buildServer } from "../../../server";
import { faker } from "@faker-js/faker/.";
import { BadRequestError } from "../../../src/config/BaseError";
import { ERROR_VALIDATION } from "../../../src/utils/messages";
import HttpStatusCode from "http-status-codes";

jest.mock("../../../src/service/User");

describe("POST /reset-password", () => {
  let serverStub: FastifyInstance;

  beforeAll(async () => {
    serverStub = buildServer();
  });

  afterAll(async () => {
    await serverStub.close();
  });

  it("Password updated successfully", async () => {
    const tokenQuery = { token: faker.string.alphanumeric(30) };
    const passwordInput = {
      password: faker.internet.password(),
      get confirmPassword() {
        return this.password;
      },
    };

    const resetPasswordServiceSpy = jest
      .spyOn(UserService.prototype, "resetPassword")
      .mockResolvedValue();

    const response = await serverStub.inject({
      method: "POST",
      url: "/reset-password",
      query: tokenQuery,
      payload: passwordInput,
    });

    expect(response.statusCode).toBe(HttpStatusCode.NO_CONTENT);
    expect(response.body).toEqual("");
    expect(resetPasswordServiceSpy).toHaveBeenCalledWith(
      tokenQuery.token,
      ...Object.values(passwordInput),
    );

    resetPasswordServiceSpy.mockRestore();
  });

  it("Error updating password", async () => {
    const tokenQuery = { token: faker.string.alphanumeric(30) };
    const passwordInput = {
      password: faker.internet.password(),
      confirmPassword: faker.internet.password(),
    };

    const messageError = "error";
    const resetPasswordServiceSpy = jest
      .spyOn(UserService.prototype, "resetPassword")
      .mockRejectedValue(new BadRequestError(messageError));

    const response = await serverStub.inject({
      method: "POST",
      url: "/reset-password",
      query: tokenQuery,
      payload: passwordInput,
    });

    expect(response.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
    expect(response.headers["content-type"]).toBe(
      "application/json; charset=utf-8",
    );
    expect(response.json()).toEqual({ message: messageError });
    expect(resetPasswordServiceSpy).toHaveBeenCalledWith(
      tokenQuery.token,
      ...Object.values(passwordInput),
    );

    resetPasswordServiceSpy.mockRestore();
  });

  it("Error validation - example: password cannot be empty", async () => {
    const tokenQuery = { token: faker.string.alphanumeric(30) };
    const passwordInput = {
      password: "",
      confirmPassword: faker.internet.password(),
    };

    const response = await serverStub.inject({
      method: "POST",
      url: "/reset-password",
      query: tokenQuery,
      payload: passwordInput,
    });

    expect(response.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
    expect(response.json()).toEqual({
      details: ["String must contain at least 1 character(s)"],
      message: ERROR_VALIDATION,
    });
  });
});
