import { SignInService } from "../../../src/service/SignIn";
import { SendEmailService } from "../../../src/config/EmailSending.config";
import { UserRepository } from "../../../src/repositories/User";
import { SendEmailConfirmEmailService } from "../../../src/service/SendEmailConfirmEmail";
import jwt from "jsonwebtoken";
import { faker } from "@faker-js/faker";
import { UUID } from "../../../src/@types";
import {
  BadRequestError,
  UnauthorizedError,
} from "../../../src/config/BaseError";
import bcrypt from "bcrypt";

jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("../../../src/repositories/User");
jest.mock("../../../src/service/SendEmailConfirmEmail");

const makeSut = () => {
  const userRepositoryStub =
    new UserRepository() as jest.Mocked<UserRepository>;
  const sendEmailConfirmEmailServiceStub = new SendEmailConfirmEmailService(
    new SendEmailService(),
  ) as jest.Mocked<SendEmailConfirmEmailService>;
  const sut = new SignInService(
    userRepositoryStub,
    sendEmailConfirmEmailServiceStub,
  );

  return { sut, userRepositoryStub };
};

describe("SignInService", () => {
  it("Token generated successfully", async () => {
    const { sut, userRepositoryStub } = makeSut();
    const usernameMock = faker.person.firstName();
    const loginMock = faker.internet.email();
    const passwordMock = "A@#z123457890";
    const passwordHashMock = faker.string.alphanumeric(10);
    const tokenMock = faker.string.alphanumeric(10);
    const idMock = faker.string.uuid() as unknown as UUID;

    userRepositoryStub.getUserByLogin.mockImplementationOnce(async () => ({
      id: idMock,
      username: usernameMock,
      email: loginMock,
      confirmed: true,
      passwordHash: passwordHashMock,
    }));

    (bcrypt.compare as jest.Mock).mockImplementationOnce(async () => true);

    (jwt.sign as jest.Mock).mockImplementationOnce(
      async (payload, secret, time, cb) => {
        cb(null, tokenMock);
      },
    );

    userRepositoryStub.getRoleAndPermissions.mockImplementationOnce(
      async () => ({
        role: "role",
        permissions: ["permissions"],
      }),
    );

    expect(await sut.execute(loginMock, passwordMock)).toEqual(tokenMock);

    expect(userRepositoryStub.getUserByLogin).toHaveBeenCalledWith(loginMock);
    expect(userRepositoryStub.getRoleAndPermissions).toHaveBeenCalledWith(
      idMock,
    );
  });

  it("should return unauthorized error if it does not generate a token", async () => {
    const { sut, userRepositoryStub } = makeSut();
    const usernameMock = faker.person.firstName();
    const loginMock = faker.internet.email();
    const passwordMock = "A@#z123457890";
    3;
    const passwordHashMock = faker.string.alphanumeric(10);
    const idMock = faker.string.uuid() as unknown as UUID;

    userRepositoryStub.getUserByLogin.mockImplementationOnce(async () => ({
      id: idMock,
      username: usernameMock,
      email: loginMock,
      confirmed: true,
      passwordHash: passwordHashMock,
    }));

    (bcrypt.compare as jest.Mock).mockImplementationOnce(async () => true);

    (jwt.sign as jest.Mock).mockImplementationOnce(
      async (payload, secret, time, cb) => {
        cb(new UnauthorizedError("error"), null);
      },
    );

    userRepositoryStub.getRoleAndPermissions.mockImplementationOnce(
      async () => ({
        role: "role",
        permissions: ["permissions"],
      }),
    );

    await expect(sut.execute(loginMock, passwordMock)).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
    expect(userRepositoryStub.getUserByLogin).toHaveBeenCalledWith(loginMock);
    expect(userRepositoryStub.getRoleAndPermissions).toHaveBeenCalledWith(
      idMock,
    );
  });

  it("should return bad request error if passwords do not match", async () => {
    const { sut, userRepositoryStub } = makeSut();
    const usernameMock = faker.person.firstName();
    const loginMock = faker.internet.email();
    const passwordMock = "A@#z123457890";
    3;
    const passwordHashMock = faker.string.alphanumeric(10);
    const idMock = faker.string.uuid() as unknown as UUID;

    userRepositoryStub.getUserByLogin.mockImplementationOnce(async () => ({
      id: idMock,
      username: usernameMock,
      email: loginMock,
      confirmed: true,
      passwordHash: passwordHashMock,
    }));

    (bcrypt.compare as jest.Mock).mockImplementationOnce(async () => false);

    await expect(sut.execute(loginMock, passwordMock)).rejects.toBeInstanceOf(
      BadRequestError,
    );
    expect(userRepositoryStub.getUserByLogin).toHaveBeenCalledWith(loginMock);
    expect(userRepositoryStub.getRoleAndPermissions).not.toHaveBeenCalled();
  });

  it("should return unauthorized error if user is already registered, but with unconfirmed email address", async () => {
    const { sut, userRepositoryStub } = makeSut();
    const usernameMock = faker.person.firstName();
    const loginMock = faker.internet.email();
    const passwordMock = "A@#z123457890";
    3;
    const passwordHashMock = faker.string.alphanumeric(10);
    const idMock = faker.string.uuid() as unknown as UUID;

    userRepositoryStub.getUserByLogin.mockImplementationOnce(async () => ({
      id: idMock,
      username: usernameMock,
      email: loginMock,
      confirmed: false,
      passwordHash: passwordHashMock,
    }));

    await expect(sut.execute(loginMock, passwordMock)).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
    expect(userRepositoryStub.getUserByLogin).toHaveBeenCalledWith(loginMock);
    expect(userRepositoryStub.getRoleAndPermissions).not.toHaveBeenCalled();
  });

  it("should return bad request error if non-existent user", async () => {
    const { sut, userRepositoryStub } = makeSut();
    const loginMock = faker.internet.email();
    const passwordMock = faker.internet.password();
    3;

    userRepositoryStub.getUserByLogin.mockImplementationOnce(
      async () => undefined,
    );

    await expect(sut.execute(loginMock, passwordMock)).rejects.toBeInstanceOf(
      BadRequestError,
    );
    expect(userRepositoryStub.getUserByLogin).toHaveBeenCalledWith(loginMock);
    expect(userRepositoryStub.getRoleAndPermissions).not.toHaveBeenCalled();
  });
});
