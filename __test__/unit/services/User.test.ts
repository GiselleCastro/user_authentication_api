import { UserService } from "../../../src/service/User";
import { UserRepository } from "../../../src/repositories/User";
import { TokenToResetPasswordRepository } from "../../../src/repositories/TokenToResetPassword";
import { SendEmailService } from "../../../src/service/SendEmail";

import jwt from "jsonwebtoken";
import { faker } from "@faker-js/faker/.";
import {
  BadRequestError,
  UnauthorizedError,
  UnprocessableEntityError,
} from "../../../src/config/BaseError";
import { UUID } from "../../../src/@types";

jest.mock("jsonwebtoken");
jest.mock("../../../src/repositories/User");
jest.mock("../../../src/repositories/TokenToResetPassword");
jest.mock("../../../src/service/SendEmail");

const makeSut = () => {
  const userRepositoryStub =
    new UserRepository() as jest.Mocked<UserRepository>;
  const tokenToResetPasswordRepositoryStub =
    new TokenToResetPasswordRepository() as jest.Mocked<TokenToResetPasswordRepository>;
  const sendEmailServiceStub =
    new SendEmailService() as jest.Mocked<SendEmailService>;
  const sut = new UserService(
    userRepositoryStub,
    sendEmailServiceStub,
    tokenToResetPasswordRepositoryStub,
  );

  return {
    sut,
    userRepositoryStub,
    sendEmailServiceStub,
    tokenToResetPasswordRepositoryStub,
  };
};

describe("UserService", () => {
  describe("createUser", () => {
    it("User created successfully", async () => {
      const { sut, userRepositoryStub, sendEmailServiceStub } = makeSut();
      const usernameMock = faker.person.firstName();
      const emailMock = faker.internet.email();
      const passwordMock = "A@#z123457890";

      userRepositoryStub.getUserByUsernameOrEmail.mockImplementationOnce(
        async () => undefined,
      );

      sendEmailServiceStub.toConfirmEmail.mockImplementationOnce(
        async () => {},
      );

      expect(
        await sut.createUser(
          usernameMock,
          emailMock,
          passwordMock,
          passwordMock,
        ),
      ).toBeUndefined();

      expect(userRepositoryStub.getUserByUsernameOrEmail).toHaveBeenCalled();
      expect(sendEmailServiceStub.toConfirmEmail).toHaveBeenCalledWith(
        usernameMock,
        emailMock,
      );
    });

    it("should return bad request error if user is already registered", async () => {
      const { sut, userRepositoryStub, sendEmailServiceStub } = makeSut();
      const usernameMock = faker.person.firstName();
      const emailMock = faker.internet.email();
      const passwordMock = "A@#z123457890";

      userRepositoryStub.getUserByUsernameOrEmail.mockImplementationOnce(
        async () => ({
          username: usernameMock,
          email: emailMock,
          confirmed: true,
        }),
      );

      await expect(
        sut.createUser(usernameMock, emailMock, passwordMock, passwordMock),
      ).rejects.toBeInstanceOf(BadRequestError);
      expect(
        userRepositoryStub.getUserByUsernameOrEmail(usernameMock, emailMock),
      );
      expect(sendEmailServiceStub.toConfirmEmail).not.toHaveBeenCalled();
    });

    it("should return unauthorized error if user is already registered, but with unconfirmed email address", async () => {
      const { sut, userRepositoryStub, sendEmailServiceStub } = makeSut();
      const usernameMock = faker.person.firstName();
      const emailMock = faker.internet.email();
      const passwordMock = "A@#z123457890";

      userRepositoryStub.getUserByUsernameOrEmail.mockImplementationOnce(
        async () => ({
          username: usernameMock,
          email: emailMock,
          confirmed: false,
        }),
      );

      await expect(
        sut.createUser(usernameMock, emailMock, passwordMock, passwordMock),
      ).rejects.toBeInstanceOf(UnauthorizedError);
      expect(
        userRepositoryStub.getUserByUsernameOrEmail(usernameMock, emailMock),
      );
      expect(sendEmailServiceStub.toConfirmEmail).toHaveBeenCalled();
    });

    it("should return bad request error if passwords do not match", async () => {
      const { sut, userRepositoryStub, sendEmailServiceStub } = makeSut();
      const usernameMock = faker.person.firstName();
      const emailMock = faker.internet.email();
      const passwordMock = faker.internet.password();
      const passwordConfirmedMock = faker.internet.password();

      userRepositoryStub.getUserByUsernameOrEmail.mockImplementationOnce(
        async () => undefined,
      );

      await expect(
        sut.createUser(
          usernameMock,
          emailMock,
          passwordMock,
          passwordConfirmedMock,
        ),
      ).rejects.toBeInstanceOf(BadRequestError);
      expect(
        userRepositoryStub.getUserByUsernameOrEmail(usernameMock, emailMock),
      );
      expect(sendEmailServiceStub.toConfirmEmail).not.toHaveBeenCalled();
    });
  });

  describe("confirmEmail", () => {
    it("Email confirmed successfully", async () => {
      const { sut, userRepositoryStub } = makeSut();
      const passwordMock = "A@#z123457890";
      const idMock = faker.string.uuid() as unknown as UUID;
      const usernameMock = faker.person.firstName();
      const tokenMock = faker.string.alphanumeric(10);
      const loginMock = faker.internet.email();

      (jwt.verify as jest.Mock).mockImplementationOnce((token, secret, cb) => {
        cb(null, { email: loginMock });
      });

      userRepositoryStub.getUserByLogin.mockResolvedValueOnce({
        id: idMock,
        username: usernameMock,
        email: loginMock,
        confirmed: false,
        passwordHash: passwordMock,
      });

      userRepositoryStub.confirmEmail.mockResolvedValueOnce(1);

      expect(await sut.confirmEmail(tokenMock)).toBeUndefined();
      expect(userRepositoryStub.getUserByLogin).toHaveBeenCalledWith(loginMock);
      expect(userRepositoryStub.confirmEmail).toHaveBeenCalledWith(loginMock);
    });

    it("should return bad request if not found to get for email by token", async () => {
      const { sut, userRepositoryStub } = makeSut();
      const tokenMock = faker.string.alphanumeric(10);
      const loginMock = faker.internet.email();

      (jwt.verify as jest.Mock).mockImplementationOnce((token, secret, cb) => {
        cb(null, { email: loginMock });
      });

      userRepositoryStub.getUserByLogin.mockImplementationOnce(
        async () => undefined,
      );

      await expect(sut.confirmEmail(tokenMock)).rejects.toBeInstanceOf(
        BadRequestError,
      );
      expect(userRepositoryStub.getUserByLogin).toHaveBeenCalledWith(loginMock);
    });

    it("should return unauthorized error for invalid token", async () => {
      async () => {
        const { sut } = makeSut();
        const tokenMock = faker.string.alphanumeric(10);

        (jwt.verify as jest.Mock).mockImplementationOnce(
          (token, secret, cb) => {
            cb(new UnauthorizedError("error"));
          },
        );

        await expect(sut.confirmEmail(tokenMock)).rejects.toThrow(
          UnauthorizedError,
        );
      };
    });
  });

  describe("sendEmailToResetPassword", () => {
    it("Email to reset password sent successfully", async () => {
      const {
        sut,
        userRepositoryStub,
        sendEmailServiceStub,
        tokenToResetPasswordRepositoryStub,
      } = makeSut();

      const usernameMock = faker.person.firstName();
      const passwordHashMock = faker.string.alphanumeric(10);
      const idMock = faker.string.uuid() as unknown as UUID;
      const tokenMock = faker.string.alphanumeric(10);

      const loginMock = faker.internet.email();

      userRepositoryStub.getUserByLogin.mockImplementationOnce(async () => ({
        id: idMock,
        username: usernameMock,
        email: loginMock,
        confirmed: true,
        passwordHash: passwordHashMock,
      }));

      sendEmailServiceStub.toResetPassword.mockImplementationOnce(
        async () => tokenMock,
      );

      tokenToResetPasswordRepositoryStub.deleteToken.mockImplementationOnce(
        async () => 1,
      );

      tokenToResetPasswordRepositoryStub.saveToken.mockResolvedValue(
        async () => undefined,
      );

      expect(await sut.sendEmailToResetPassword(loginMock)).toBeUndefined();

      expect(userRepositoryStub.getUserByLogin).toHaveBeenCalledWith(loginMock);
      expect(
        tokenToResetPasswordRepositoryStub.deleteToken,
      ).toHaveBeenCalledWith(loginMock);
      expect(tokenToResetPasswordRepositoryStub.saveToken).toHaveBeenCalledWith(
        loginMock,
        tokenMock,
      );
    });

    it("should return bad request if non-existent user", async () => {
      const { sut, userRepositoryStub, tokenToResetPasswordRepositoryStub } =
        makeSut();

      const loginMock = faker.internet.email();

      userRepositoryStub.getUserByLogin.mockImplementationOnce(
        async () => undefined,
      );

      await expect(
        sut.sendEmailToResetPassword(loginMock),
      ).rejects.toBeInstanceOf(BadRequestError);

      expect(userRepositoryStub.getUserByLogin).toHaveBeenCalledWith(loginMock);
      expect(
        tokenToResetPasswordRepositoryStub.deleteToken,
      ).not.toHaveBeenCalled();
      expect(
        tokenToResetPasswordRepositoryStub.saveToken,
      ).not.toHaveBeenCalled();
    });
  });

  describe("resetPassword", () => {
    it("Password updated successfully", async () => {
      const { sut, userRepositoryStub, tokenToResetPasswordRepositoryStub } =
        makeSut();
      const passwordMock = "A@#z123457890";
      const tokenMock = faker.string.alphanumeric(10);
      const loginMock = faker.internet.email();

      (jwt.verify as jest.Mock).mockImplementationOnce(
        (token, secret, cb) => {},
      );

      tokenToResetPasswordRepositoryStub.getLoginByToken.mockResolvedValueOnce({
        login: loginMock,
      });

      userRepositoryStub.updatePassword.mockImplementationOnce(async () => []);

      tokenToResetPasswordRepositoryStub.deleteToken.mockImplementation(
        async () => {
          return 1;
        },
      );

      expect(
        await sut.resetPassword(tokenMock, passwordMock, passwordMock),
      ).toBeUndefined();

      expect(
        tokenToResetPasswordRepositoryStub.getLoginByToken,
      ).toHaveBeenCalledWith(tokenMock);
      expect(userRepositoryStub.updatePassword).toHaveBeenCalled();
      expect(
        tokenToResetPasswordRepositoryStub.deleteToken,
      ).toHaveBeenCalledWith(tokenMock);
    });

    it("should return unprocessable entity error if not found to get for login by token", async () => {
      const { sut, tokenToResetPasswordRepositoryStub } = makeSut();
      const passwordMock = "A@#z123457890";
      const tokenMock = faker.string.alphanumeric(10);

      (jwt.verify as jest.Mock).mockImplementationOnce(
        (token, secret, cb) => {},
      );

      tokenToResetPasswordRepositoryStub.getLoginByToken.mockImplementationOnce(
        async () => ({}),
      );

      await expect(
        sut.resetPassword(tokenMock, passwordMock, passwordMock),
      ).rejects.toBeInstanceOf(UnprocessableEntityError);

      expect(
        tokenToResetPasswordRepositoryStub.getLoginByToken,
      ).toHaveBeenCalledWith(tokenMock);
    });

    it("should return bad request error if passwords do not match", async () => {
      const { sut, tokenToResetPasswordRepositoryStub } = makeSut();
      const loginMock = faker.internet.email();

      (jwt.verify as jest.Mock).mockImplementationOnce(
        (token, secret, cb) => {},
      );

      tokenToResetPasswordRepositoryStub.getLoginByToken.mockResolvedValueOnce({
        login: loginMock,
      });

      await expect(
        sut.resetPassword(
          faker.string.alphanumeric(10),
          faker.internet.password(),
          faker.internet.password(),
        ),
      ).rejects.toBeInstanceOf(BadRequestError);
    });

    it("should return unauthorized error for invalid token", async () => {
      const { sut } = makeSut();

      (jwt.verify as jest.Mock).mockImplementationOnce((token, secret, cb) => {
        cb(new UnauthorizedError("error"));
      });

      expect(
        sut.resetPassword(
          faker.string.alphanumeric(10),
          faker.internet.password(),
          faker.internet.password(),
        ),
      ).rejects.toBeInstanceOf(UnauthorizedError);
    });
  });
});
