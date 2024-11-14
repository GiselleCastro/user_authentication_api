import { SendEmailService } from "../../../src/config/EmailSending.config";
import { UserRepository } from "../../../src/repositories/User";
import { SendEmailConfirmEmailService } from "../../../src/service/SendEmailConfirmEmail";
import { CreateUserService } from "../../../src/service/CreateUser";
import { faker } from "@faker-js/faker";
import {
  BadRequestError,
  UnauthorizedError,
} from "../../../src/config/BaseError";

jest.mock("../../../src/repositories/User");
jest.mock("../../../src/service/SendEmailConfirmEmail");

const makeSut = () => {
  const userRepositoryStub =
    new UserRepository() as jest.Mocked<UserRepository>;
  const sendEmailConfirmEmailServiceStub = new SendEmailConfirmEmailService(
    new SendEmailService(),
  ) as jest.Mocked<SendEmailConfirmEmailService>;

  const sut = new CreateUserService(
    userRepositoryStub,
    sendEmailConfirmEmailServiceStub,
  );

  return {
    sut,
    userRepositoryStub,
    sendEmailConfirmEmailServiceStub,
  };
};

describe("CreateUserService", () => {
  it("User created successfully", async () => {
    const { sut, userRepositoryStub, sendEmailConfirmEmailServiceStub } =
      makeSut();
    const usernameMock = faker.person.firstName();
    const emailMock = faker.internet.email();
    const passwordMock = "A@#z123457890";

    userRepositoryStub.getUserByUsernameOrEmail.mockImplementationOnce(
      async () => undefined,
    );

    sendEmailConfirmEmailServiceStub.execute.mockImplementationOnce(
      async () => {},
    );

    expect(
      await sut.execute(usernameMock, emailMock, passwordMock, passwordMock),
    ).toBeUndefined();

    expect(userRepositoryStub.getUserByUsernameOrEmail).toHaveBeenCalled();
    expect(sendEmailConfirmEmailServiceStub.execute).toHaveBeenCalledWith(
      usernameMock,
      emailMock,
    );
  });

  it("should return bad request error if user is already registered", async () => {
    const { sut, userRepositoryStub, sendEmailConfirmEmailServiceStub } =
      makeSut();
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
      sut.execute(usernameMock, emailMock, passwordMock, passwordMock),
    ).rejects.toBeInstanceOf(BadRequestError);
    expect(
      userRepositoryStub.getUserByUsernameOrEmail(usernameMock, emailMock),
    );
    expect(sendEmailConfirmEmailServiceStub.execute).not.toHaveBeenCalled();
  });

  it("should return unauthorized error if user is already registered, but with unconfirmed email address", async () => {
    const { sut, userRepositoryStub, sendEmailConfirmEmailServiceStub } =
      makeSut();
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
      sut.execute(usernameMock, emailMock, passwordMock, passwordMock),
    ).rejects.toBeInstanceOf(UnauthorizedError);
    expect(
      userRepositoryStub.getUserByUsernameOrEmail(usernameMock, emailMock),
    );
    expect(sendEmailConfirmEmailServiceStub.execute).toHaveBeenCalled();
  });

  it("should return bad request error if weak password", async () => {
    const { sut, userRepositoryStub, sendEmailConfirmEmailServiceStub } =
      makeSut();
    const usernameMock = faker.person.firstName();
    const emailMock = faker.internet.email();
    const passwordMock = "Aaaaaaaaa";
    const passwordConfirmedMock = faker.internet.password();

    userRepositoryStub.getUserByUsernameOrEmail.mockImplementationOnce(
      async () => undefined,
    );

    await expect(
      sut.execute(usernameMock, emailMock, passwordMock, passwordConfirmedMock),
    ).rejects.toBeInstanceOf(BadRequestError);
    expect(
      userRepositoryStub.getUserByUsernameOrEmail(usernameMock, emailMock),
    );
    expect(sendEmailConfirmEmailServiceStub.execute).not.toHaveBeenCalled();
  });

  it("should return bad request error if passwords do not match", async () => {
    const { sut, userRepositoryStub, sendEmailConfirmEmailServiceStub } =
      makeSut();
    const usernameMock = faker.person.firstName();
    const emailMock = faker.internet.email();
    const passwordMock = "A@123456z";
    const passwordConfirmedMock = faker.internet.password();

    userRepositoryStub.getUserByUsernameOrEmail.mockImplementationOnce(
      async () => undefined,
    );

    await expect(
      sut.execute(usernameMock, emailMock, passwordMock, passwordConfirmedMock),
    ).rejects.toBeInstanceOf(BadRequestError);
    expect(
      userRepositoryStub.getUserByUsernameOrEmail(usernameMock, emailMock),
    );
    expect(sendEmailConfirmEmailServiceStub.execute).not.toHaveBeenCalled();
  });
});
