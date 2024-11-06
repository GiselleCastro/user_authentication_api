import type { FastifyInstance } from "fastify/types/instance";
import { SendEmailResetPasswordService } from "../../../src/service/SendEmailResetPassword";
import { buildServer } from "../../../server";
import { faker } from "@faker-js/faker";
import { BadRequestError } from "../../../src/config/BaseError";
import { ERROR_VALIDATION } from "../../../src/utils/messages";
import HttpStatusCode from "http-status-codes";

jest.mock("../../../src/service/SendEmailResetPassword");

describe("POST /forgot-password", () => {
  let serverStub: FastifyInstance;

  beforeAll(async () => {
    serverStub = buildServer();
  });

  afterAll(async () => {
    await serverStub.close();
  });

  it("Email sent successfully", async () => {
    const loginInput = {
      login: faker.internet.email(),
    };

    const generateTokenServiceSpy = jest
      .spyOn(SendEmailResetPasswordService.prototype, "execute")
      .mockResolvedValue();

    const response = await serverStub.inject({
      method: "POST",
      url: "/forgot-password",
      payload: loginInput,
    });

    expect(response.statusCode).toBe(HttpStatusCode.NO_CONTENT);
    expect(response.body).toEqual("");
    expect(generateTokenServiceSpy).toHaveBeenCalledWith(
      ...Object.values(loginInput),
    );

    generateTokenServiceSpy.mockRestore();
  });

  it("Error sending email", async () => {
    const loginInput = {
      login: faker.internet.email(),
    };

    const messageError = "error";
    const generateTokenServiceSpy = jest
      .spyOn(SendEmailResetPasswordService.prototype, "execute")
      .mockRejectedValue(new BadRequestError(messageError));

    const response = await serverStub.inject({
      method: "POST",
      url: "/forgot-password",
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

  it("Error validation - example: login cannot be empty", async () => {
    const loginInput = {
      login: "",
    };

    const response = await serverStub.inject({
      method: "POST",
      url: "/forgot-password",
      payload: loginInput,
    });

    expect(response.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
    expect(response.json()).toEqual({
      details: ["String must contain at least 1 character(s)"],
      message: ERROR_VALIDATION,
    });
  });
});
