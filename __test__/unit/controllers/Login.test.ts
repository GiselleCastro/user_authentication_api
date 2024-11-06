import type { FastifyInstance } from "fastify/types/instance";
import { GenerateTokenService } from "../../../src/service/GenerateToken";
import { buildServer } from "../../../server";
import { faker } from "@faker-js/faker/.";
import { BadRequestError } from "../../../src/utils/errors";
import { ERROR_VALIDATION } from "../../../src/utils/messages";
import HttpStatusCode from "http-status-codes";

jest.mock("../../../src/service/GenerateToken");

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

    const tokenMock = faker.string.alphanumeric(30);
    const generateTokenServiceSpy = jest
      .spyOn(GenerateTokenService.prototype, "execute")
      .mockResolvedValue(tokenMock);

    const response = await serverStub.inject({
      method: "POST",
      url: "/login",
      payload: loginInput,
    });

    expect(response.statusCode).toBe(HttpStatusCode.OK);
    expect(response.headers["content-type"]).toBe(
      "application/json; charset=utf-8",
    );
    expect(response.json()).toEqual({ token: tokenMock });
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
      .spyOn(GenerateTokenService.prototype, "execute")
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
