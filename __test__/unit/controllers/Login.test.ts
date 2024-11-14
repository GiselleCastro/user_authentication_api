import type { FastifyInstance } from "fastify/types/instance";
import { SignInService } from "../../../src/service/SignIn";
import { buildServer } from "../../../src/server";
import { faker } from "@faker-js/faker";
import { BadRequestError } from "../../../src/config/BaseError";
import { ERROR_VALIDATION } from "../../../src/utils/messages";
import HttpStatusCode from "http-status-codes";

jest.mock("../../../src/service/SignIn");

describe("POST /login", () => {
  let serverStub: FastifyInstance;

  beforeAll(async () => {
    serverStub = buildServer();
  });

  afterAll(async () => {
    await serverStub.close();
  });

  it("Token generated successfully", async () => {
    const loginInput = {
      login: faker.internet.email(),
      password: faker.internet.password(),
    };

    const accessTokenMock = faker.string.alphanumeric(30);
    const refreshTokenMock = faker.string.alphanumeric(30);

    const generateTokenServiceSpy = jest
      .spyOn(SignInService.prototype, "execute")
      .mockResolvedValue({
        accessToken: accessTokenMock,
        refreshToken: refreshTokenMock,
      });

    const response = await serverStub.inject({
      method: "POST",
      url: "/login",
      payload: loginInput,
    });

    expect(response.statusCode).toBe(HttpStatusCode.OK);
    expect(response.headers["content-type"]).toBe(
      "application/json; charset=utf-8",
    );
    expect(response.json()).toEqual({
      accessToken: accessTokenMock,
      refreshToken: refreshTokenMock,
    });
    expect(generateTokenServiceSpy).toHaveBeenCalledWith(
      ...Object.values(loginInput),
    );

    generateTokenServiceSpy.mockRestore();
  });

  it("Error generating token", async () => {
    const loginInput = {
      login: faker.internet.email(),
      password: faker.internet.password(),
    };

    const messageError = "error";
    const generateTokenServiceSpy = jest
      .spyOn(SignInService.prototype, "execute")
      .mockRejectedValue(new BadRequestError(messageError));

    const response = await serverStub.inject({
      method: "POST",
      url: "/login",
      payload: loginInput,
    });

    expect(response.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
    expect(response.headers["content-type"]).toBe(
      "application/json; charset=utf-8",
    );
    expect(response.json()).toEqual({ message: messageError });
    expect(generateTokenServiceSpy).toHaveBeenCalledWith(
      ...Object.values(loginInput),
    );

    generateTokenServiceSpy.mockRestore();
  });

  it("Error validation - example: password cannot be empty", async () => {
    const loginInput = {
      login: faker.internet.email(),
      password: "",
    };

    const response = await serverStub.inject({
      method: "POST",
      url: "/login",
      payload: loginInput,
    });

    expect(response.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
    expect(response.json()).toEqual({
      details: ["String must contain at least 1 character(s)"],
      message: ERROR_VALIDATION,
    });
  });
});
