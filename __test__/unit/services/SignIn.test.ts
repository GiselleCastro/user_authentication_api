import { SignInService } from "../../../src/service/SignIn";
import { UserRepository } from "../../../src/repositories/User";
import { GenerateRefreshTokenAndAccessTokenService } from "../../../src/service/GenerateRefreshTokenAndAccessToken";
import { SendEmailConfirmEmailService } from "../../../src/service/SendEmailConfirmEmail";
import { RefreshTokenRepository } from "../../../src/repositories/RefreshToken";
import { SendEmailService } from "../../../src/config/EmailSending.config";

import { faker } from "@faker-js/faker";
import { UUID } from "../../../src/@types";
import {
  BadRequestError,
  UnauthorizedError,
} from "../../../src/config/BaseError";
import bcrypt from "bcrypt";

jest.mock("bcrypt");
jest.mock("../../../src/repositories/User");
jest.mock("../../../src/service/GenerateRefreshTokenAndAccessToken");
jest.mock("../../../src/service/SendEmailConfirmEmail");

const makeSut = () => {
  const userRepositoryStub =
    new UserRepository() as jest.Mocked<UserRepository>;
  const generateRefreshTokenAndAccessTokenServiceStub =
    new GenerateRefreshTokenAndAccessTokenService(
      new UserRepository(),
      new RefreshTokenRepository(),
    ) as jest.Mocked<GenerateRefreshTokenAndAccessTokenService>;
  const sendEmailConfirmEmailServiceStub = new SendEmailConfirmEmailService(
    new SendEmailService(),
  ) as jest.Mocked<SendEmailConfirmEmailService>;

  const sut = new SignInService(
    userRepositoryStub,
    generateRefreshTokenAndAccessTokenServiceStub,
    sendEmailConfirmEmailServiceStub,
  );

  return {
    sut,
    userRepositoryStub,
    generateRefreshTokenAndAccessTokenServiceStub,
    sendEmailConfirmEmailServiceStub,
  };
};

describe("SignInService", () => {
  it("Access token and refresh token generated successfully", async () => {
    const {
      sut,
      userRepositoryStub,
      generateRefreshTokenAndAccessTokenServiceStub,
    } = makeSut();
    const usernameMock = faker.person.firstName();
    const loginMock = faker.internet.email();
    const passwordMock = "A@#z123457890";
    const passwordHashMock = faker.string.alphanumeric(10);
    const accessTokenMock = faker.string.alphanumeric(10);
    const refreshTokenMock = faker.string.alphanumeric(10);

    const idMock = faker.string.uuid() as unknown as UUID;

    userRepositoryStub.getUserByLogin.mockImplementationOnce(async () => ({
      id: idMock,
      username: usernameMock,
      email: loginMock,
      confirmed: true,
      password_hash: passwordHashMock,
    }));

    (bcrypt.compare as jest.Mock).mockImplementationOnce(async () => true);

    (
      generateRefreshTokenAndAccessTokenServiceStub.execute as jest.Mock
    ).mockResolvedValueOnce({
      accessToken: accessTokenMock,
      refreshToken: refreshTokenMock,
    });

    expect(await sut.execute(loginMock, passwordMock)).toEqual({
      accessToken: accessTokenMock,
      refreshToken: refreshTokenMock,
    });

    expect(
      generateRefreshTokenAndAccessTokenServiceStub.execute,
    ).toHaveBeenCalledWith(idMock);
  });

  it("should return bad request error if passwords do not match", async () => {
    const {
      sut,
      userRepositoryStub,
      generateRefreshTokenAndAccessTokenServiceStub,
    } = makeSut();
    const usernameMock = faker.person.firstName();
    const loginMock = faker.internet.email();
    const passwordMock = faker.internet.password();
    const passwordHashMock = faker.string.alphanumeric(10);
    const idMock = faker.string.uuid() as unknown as UUID;

    userRepositoryStub.getUserByLogin.mockImplementationOnce(async () => ({
      id: idMock,
      username: usernameMock,
      email: loginMock,
      confirmed: true,
      password_hash: passwordHashMock,
    }));

    (bcrypt.compare as jest.Mock).mockImplementationOnce(async () => false);

    await expect(sut.execute(loginMock, passwordMock)).rejects.toBeInstanceOf(
      BadRequestError,
    );
    expect(userRepositoryStub.getUserByLogin).toHaveBeenCalledWith(loginMock);
    expect(
      generateRefreshTokenAndAccessTokenServiceStub.execute,
    ).not.toHaveBeenCalled();
  });

  it("should return unauthorized error if user is already registered, but with unconfirmed email address", async () => {
    const { sut, userRepositoryStub, sendEmailConfirmEmailServiceStub } =
      makeSut();
    const usernameMock = faker.person.firstName();
    const loginMock = faker.internet.email();
    const passwordMock = "A@#z123457890";
    const passwordHashMock = faker.string.alphanumeric(10);
    const idMock = faker.string.uuid() as unknown as UUID;

    userRepositoryStub.getUserByLogin.mockImplementationOnce(async () => ({
      id: idMock,
      username: usernameMock,
      email: loginMock,
      confirmed: false,
      password_hash: passwordHashMock,
    }));

    await expect(sut.execute(loginMock, passwordMock)).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
    expect(userRepositoryStub.getUserByLogin).toHaveBeenCalledWith(loginMock);
    expect(sendEmailConfirmEmailServiceStub.execute).toHaveBeenLastCalledWith(
      usernameMock,
      loginMock,
    );
  });

  it("should return bad request error if non-existent user", async () => {
    const { sut, userRepositoryStub } = makeSut();
    const loginMock = faker.internet.email();
    const passwordMock = faker.internet.password();

    userRepositoryStub.getUserByLogin.mockImplementationOnce(
      async () => undefined,
    );

    await expect(sut.execute(loginMock, passwordMock)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });
});
