import { ResetPasswordService } from "../../../src/service/ResetPassword";
import { UserRepository } from "../../../src/repositories/User";
import { TokenToResetPasswordRepository } from "../../../src/repositories/TokenToResetPassword";
import jwt from "jsonwebtoken";
import { faker } from "@faker-js/faker";
import {
  BadRequestError,
  UnauthorizedError,
  UnprocessableEntityError,
} from "../../../src/config/BaseError";

jest.mock("jsonwebtoken");
jest.mock("../../../src/repositories/User");
jest.mock("../../../src/repositories/TokenToResetPassword");

const makeSut = () => {
  const userRepositoryStub =
    new UserRepository() as jest.Mocked<UserRepository>;
  const tokenToResetPasswordRepositoryStub =
    new TokenToResetPasswordRepository() as jest.Mocked<TokenToResetPasswordRepository>;
  const sut = new ResetPasswordService(
    userRepositoryStub,
    tokenToResetPasswordRepositoryStub,
  );

  return {
    sut,
    userRepositoryStub,
    tokenToResetPasswordRepositoryStub,
  };
};

describe("ResetPasswordService", () => {
  it("Password updated successfully", async () => {
    const { sut, userRepositoryStub, tokenToResetPasswordRepositoryStub } =
      makeSut();
    const passwordMock = "A@#z123457890";
    const tokenMock = faker.string.alphanumeric(10);
    const loginMock = faker.internet.email();

    (jwt.verify as jest.Mock).mockImplementationOnce((token, secret, cb) => {});

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
      await sut.execute(tokenMock, passwordMock, passwordMock),
    ).toBeUndefined();

    expect(
      tokenToResetPasswordRepositoryStub.getLoginByToken,
    ).toHaveBeenCalledWith(tokenMock);
    expect(userRepositoryStub.updatePassword).toHaveBeenCalled();
    expect(tokenToResetPasswordRepositoryStub.deleteToken).toHaveBeenCalledWith(
      tokenMock,
    );
  });

  it("should return unprocessable entity error if not found to get for login by token", async () => {
    const { sut, tokenToResetPasswordRepositoryStub } = makeSut();
    const passwordMock = "A@#z123457890";
    const tokenMock = faker.string.alphanumeric(10);

    (jwt.verify as jest.Mock).mockImplementationOnce((token, secret, cb) => {});

    tokenToResetPasswordRepositoryStub.getLoginByToken.mockImplementationOnce(
      async () => ({}),
    );

    await expect(
      sut.execute(tokenMock, passwordMock, passwordMock),
    ).rejects.toBeInstanceOf(UnprocessableEntityError);

    expect(
      tokenToResetPasswordRepositoryStub.getLoginByToken,
    ).toHaveBeenCalledWith(tokenMock);
  });

  it("should return bad request error if passwords do not match", async () => {
    const { sut, tokenToResetPasswordRepositoryStub } = makeSut();
    const loginMock = faker.internet.email();

    (jwt.verify as jest.Mock).mockImplementationOnce((token, secret, cb) => {});

    tokenToResetPasswordRepositoryStub.getLoginByToken.mockResolvedValueOnce({
      login: loginMock,
    });

    await expect(
      sut.execute(
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
      sut.execute(
        faker.string.alphanumeric(10),
        faker.internet.password(),
        faker.internet.password(),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
