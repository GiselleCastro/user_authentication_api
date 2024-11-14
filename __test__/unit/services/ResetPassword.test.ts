import { ResetPasswordService } from "../../../src/service/ResetPassword";
import { UserRepository } from "../../../src/repositories/User";
import { ResetPasswordRepository } from "../../../src/repositories/ResetPassword";
import { faker } from "@faker-js/faker";
import { validationToken } from "../../../src/utils/validationToken";
import {
  BadRequestError,
  UnauthorizedError,
  UnprocessableEntityError,
} from "../../../src/config/BaseError";
import { UUID } from "../../../src/@types";

jest.mock("../../../src/repositories/User");
jest.mock("../../../src/repositories/ResetPassword");
jest.mock("../../../src/utils/validationToken");

const makeSut = () => {
  const userRepositoryStub =
    new UserRepository() as jest.Mocked<UserRepository>;
  const resetPasswordRepositoryStub =
    new ResetPasswordRepository() as jest.Mocked<ResetPasswordRepository>;
  const sut = new ResetPasswordService(
    userRepositoryStub,
    resetPasswordRepositoryStub,
  );

  return {
    sut,
    userRepositoryStub,
    resetPasswordRepositoryStub,
  };
};

describe("ResetPasswordService", () => {
  it("Password updated successfully", async () => {
    const { sut, userRepositoryStub, resetPasswordRepositoryStub } = makeSut();
    const userId = faker.string.uuid() as unknown as UUID;
    const passwordMock = "A@#z123457890";
    const tokenMock = faker.string.alphanumeric(10);
    const loginMock = faker.internet.email();

    (validationToken as jest.Mock).mockResolvedValue({ id: userId });

    resetPasswordRepositoryStub.getTokenAndLoginByUserId.mockResolvedValueOnce({
      token: tokenMock,
      login: loginMock,
    });

    userRepositoryStub.updatePassword.mockImplementationOnce(async () => []);

    resetPasswordRepositoryStub.deleteToken.mockImplementationOnce(async () => {
      return 1;
    });

    expect(
      await sut.execute(tokenMock, passwordMock, passwordMock),
    ).toBeUndefined();

    expect(
      resetPasswordRepositoryStub.getTokenAndLoginByUserId,
    ).toHaveBeenCalledWith(userId);
    expect(userRepositoryStub.updatePassword).toHaveBeenCalled();
    expect(resetPasswordRepositoryStub.deleteToken).toHaveBeenCalledWith(
      userId,
    );
  });

  it("should return unprocessable entity error if not found to get for login by token", async () => {
    const { sut, resetPasswordRepositoryStub } = makeSut();
    const userId = faker.string.uuid() as unknown as UUID;
    const passwordMock = "A@#z123457890";
    const tokenMock = faker.string.alphanumeric(10);

    (validationToken as jest.Mock).mockResolvedValueOnce({ id: userId });

    resetPasswordRepositoryStub.getTokenAndLoginByUserId.mockImplementationOnce(
      async () => undefined,
    );

    await expect(
      sut.execute(tokenMock, passwordMock, passwordMock),
    ).rejects.toBeInstanceOf(UnprocessableEntityError);

    expect(
      resetPasswordRepositoryStub.getTokenAndLoginByUserId,
    ).toHaveBeenCalledWith(userId);
  });

  it("should return bad request if there is no id property in the token", async () => {
    const { sut, resetPasswordRepositoryStub } = makeSut();
    const userId = faker.string.uuid() as unknown as UUID;
    const loginMock = faker.internet.email();
    const tokenMock = faker.string.alphanumeric(10);

    (validationToken as jest.Mock).mockResolvedValue({ other: "" });

    resetPasswordRepositoryStub.getTokenAndLoginByUserId.mockResolvedValueOnce({
      login: loginMock,
      token: tokenMock,
    });

    await expect(
      sut.execute(
        faker.string.alphanumeric(10),
        faker.internet.password(),
        faker.internet.password(),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("should return unauthorized error for invalid token", async () => {
    const { sut } = makeSut();

    (validationToken as jest.Mock).mockRejectedValueOnce(
      new UnauthorizedError("error"),
    );

    expect(
      sut.execute(
        faker.string.alphanumeric(10),
        faker.internet.password(),
        faker.internet.password(),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
