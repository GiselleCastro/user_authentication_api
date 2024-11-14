import { SendEmailResetPasswordService } from "../../../src/service/SendEmailResetPassword";
import { SendEmailService } from "../../../src/config/EmailSending.config";
import { ResetPasswordRepository } from "../../../src/repositories/ResetPassword";
import { UserRepository } from "../../../src/repositories/User";
import { faker } from "@faker-js/faker";
import { BadRequestError } from "../../../src/config/BaseError";
import { createToken } from "../../../src/utils/createToken";
import { UUID } from "../../../src/@types";
import ejs from "ejs";

jest.mock("ejs");
jest.mock("../../../src/config/EmailSending.config");
jest.mock("../../../src/repositories/ResetPassword");
jest.mock("../../../src/repositories/User");
jest.mock("../../../src/utils/createToken");

const makeSut = () => {
  const sendEmailServiceStub = new SendEmailService();
  const resetPasswordRepositoryStub = new ResetPasswordRepository();
  const userRepositoryStub = new UserRepository();

  const sut = new SendEmailResetPasswordService(
    sendEmailServiceStub,
    resetPasswordRepositoryStub,
    userRepositoryStub,
  ) as jest.Mocked<SendEmailResetPasswordService>;
  return {
    sut,
    sendEmailServiceStub,
    resetPasswordRepositoryStub,
    userRepositoryStub,
  };
};

describe("SendEmailResetPasswordService", () => {
  it("Email to reset password sent successfully", async () => {
    const {
      sut,
      userRepositoryStub,
      resetPasswordRepositoryStub,
      sendEmailServiceStub,
    } = makeSut();
    const userId = faker.string.uuid() as unknown as UUID;
    const usernameMock = faker.person.firstName();
    const emailMock = faker.internet.email();
    const tokenMock = faker.string.alphanumeric(10);

    (userRepositoryStub.getUserByLogin as jest.Mock).mockResolvedValueOnce({
      id: userId,
      username: usernameMock,
      email: emailMock,
    });

    (createToken as jest.Mock).mockResolvedValueOnce(tokenMock);

    (sendEmailServiceStub.sendEmail as jest.Mock).mockResolvedValueOnce(
      async () => {},
    );

    (ejs.renderFile as jest.Mock).mockResolvedValueOnce(async () => {});

    expect(await sut.execute(usernameMock)).toBeUndefined();
    expect(ejs.renderFile).toHaveBeenCalled();
    expect(resetPasswordRepositoryStub.deleteToken).toHaveBeenCalled();
    expect(resetPasswordRepositoryStub.saveToken).toHaveBeenCalled();
  });

  it("should return bad request error if there is an error sending email", async () => {
    const { sut, userRepositoryStub, sendEmailServiceStub } = makeSut();
    const userId = faker.string.uuid() as unknown as UUID;
    const usernameMock = faker.person.firstName();
    const emailMock = faker.internet.email();
    const tokenMock = faker.string.alphanumeric(10);

    (userRepositoryStub.getUserByLogin as jest.Mock).mockResolvedValueOnce({
      id: userId,
      username: usernameMock,
      email: emailMock,
    });

    (createToken as jest.Mock).mockResolvedValueOnce(tokenMock);

    (ejs.renderFile as jest.Mock).mockResolvedValue("any");

    (sendEmailServiceStub.sendEmail as jest.Mock).mockRejectedValueOnce(
      async () => new BadRequestError("error"),
    );

    await expect(sut.execute(usernameMock)).rejects.toBeInstanceOf(
      BadRequestError,
    );
    expect(ejs.renderFile).toHaveBeenCalled();
  });

  it("should return bad request error if there is an error rendering email template", async () => {
    const { sut, userRepositoryStub } = makeSut();
    const userId = faker.string.uuid() as unknown as UUID;
    const usernameMock = faker.person.firstName();
    const emailMock = faker.internet.email();
    const tokenMock = faker.string.alphanumeric(10);

    (userRepositoryStub.getUserByLogin as jest.Mock).mockResolvedValueOnce({
      id: userId,
      username: usernameMock,
      email: emailMock,
    });

    (createToken as jest.Mock).mockResolvedValueOnce(tokenMock);

    (ejs.renderFile as jest.Mock).mockRejectedValueOnce(() => {});

    await expect(sut.execute(usernameMock)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it("should return bad request error if there is an error generating token", async () => {
    const { sut, userRepositoryStub } = makeSut();
    const userId = faker.string.uuid() as unknown as UUID;
    const usernameMock = faker.person.firstName();
    const emailMock = faker.internet.email();

    (userRepositoryStub.getUserByLogin as jest.Mock).mockResolvedValueOnce({
      id: userId,
      username: usernameMock,
      email: emailMock,
    });

    (createToken as jest.Mock).mockRejectedValueOnce(
      new BadRequestError("error"),
    );

    await expect(sut.execute(usernameMock)).rejects.toBeInstanceOf(
      BadRequestError,
    );
    expect(ejs.render).not.toHaveBeenCalled();
  });

  it("should return bad request error if non existent user", async () => {
    const { sut, userRepositoryStub } = makeSut();
    const usernameMock = faker.person.firstName();

    (userRepositoryStub.getUserByLogin as jest.Mock).mockResolvedValueOnce(
      undefined,
    );

    await expect(sut.execute(usernameMock)).rejects.toBeInstanceOf(
      BadRequestError,
    );
    expect(ejs.render).not.toHaveBeenCalled();
  });
});
