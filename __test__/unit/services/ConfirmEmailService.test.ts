import { UserRepository } from "../../../src/repositories/User";
import { ConfirmEmailService } from "../../../src/service/ConfirmEmail";
import jwt from "jsonwebtoken";
import { faker } from "@faker-js/faker";
import {
  BadRequestError,
  UnauthorizedError,
} from "../../../src/config/BaseError";
import { UUID } from "../../../src/@types";

jest.mock("jsonwebtoken");
jest.mock("../../../src/repositories/User");

const makeSut = () => {
  const userRepositoryStub =
    new UserRepository() as jest.Mocked<UserRepository>;
  const sut = new ConfirmEmailService(userRepositoryStub);

  return {
    sut,
    userRepositoryStub,
  };
};

describe("ConfirmEmailService", () => {
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

    expect(await sut.execute(tokenMock)).toBeUndefined();
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

    await expect(sut.execute(tokenMock)).rejects.toBeInstanceOf(
      BadRequestError,
    );
    expect(userRepositoryStub.getUserByLogin).toHaveBeenCalledWith(loginMock);
  });

  it("should return unauthorized error for invalid token", async () => {
    async () => {
      const { sut } = makeSut();
      const tokenMock = faker.string.alphanumeric(10);

      (jwt.verify as jest.Mock).mockImplementationOnce((token, secret, cb) => {
        cb(new UnauthorizedError("error"));
      });

      await expect(sut.execute(tokenMock)).rejects.toThrow(UnauthorizedError);
    };
  });
});
