import { SendEmailService } from "../../../src/config/EmailSending.config";
import { SendEmailResetPasswordService } from "../../../src/service/SendEmailResetPassword";
import { TokenToResetPasswordRepository } from "../../../src/repositories/TokenToResetPassword";
import { UserRepository } from "../../../src/repositories/User";
import { faker } from "@faker-js/faker";
import { BadRequestError } from "../../../src/config/BaseError";
import jwt from "jsonwebtoken";
import ejs from "ejs";

jest.mock("ejs");
jest.mock("jsonwebtoken");
jest.mock("../../../src/repositories/User");
jest.mock("../../../src/repositories/TokenToResetPassword");

const makeSut = () => {
  const sendEmailServiceStub = new SendEmailService();
  const tokenToResetPasswordRepositoryStub =
    new TokenToResetPasswordRepository();
  const userRepositoryStub = new UserRepository();

  const sut = new SendEmailResetPasswordService(
    sendEmailServiceStub,
    tokenToResetPasswordRepositoryStub,
    userRepositoryStub,
  ) as jest.Mocked<SendEmailResetPasswordService>;
  return {
    sut,
    sendEmailServiceStub,
    tokenToResetPasswordRepositoryStub,
    userRepositoryStub,
  };
};

describe("SendEmailResetPasswordService", () => {
  it.skip("Email to reset password sent successfully", async () => {
    const { sut } = makeSut();
    const usernameMock = faker.person.firstName();
    const emailMock = faker.internet.email();
    const tokenMock = faker.string.alphanumeric(10);

    (jwt.sign as jest.Mock).mockImplementationOnce(
      (payload, secret, time, cb) => {
        cb(null, tokenMock);
      },
    );

    (ejs.renderFile as jest.Mock).mockResolvedValue(undefined);

    //jest.spyOn(sut, "execute").mockResolvedValue("any");

    expect(await sut.execute(usernameMock)).toBeUndefined();
    expect(ejs.renderFile).toHaveBeenCalled();
  });

  it.skip("should return bad request error if there is an error sending email", async () => {
    const { sut, sendEmailServiceStub } = makeSut();
    const usernameMock = faker.person.firstName();
    const emailMock = faker.internet.email();
    const tokenMock = faker.string.alphanumeric(10);

    (jwt.sign as jest.Mock).mockImplementationOnce(
      (payload, secret, time, cb) => {
        cb(null, tokenMock);
      },
    );

    (ejs.renderFile as jest.Mock).mockResolvedValue("any");

    jest
      .spyOn(sendEmailServiceStub, "sendEmail")
      .mockRejectedValueOnce(async () => new BadRequestError("error"));

    await expect(sut.execute(usernameMock)).rejects.toBeInstanceOf(
      BadRequestError,
    );
    expect(ejs.renderFile).toHaveBeenCalled();
  });

  it("should return bad request error if there is an error rendering email template", async () => {
    const { sut } = makeSut();
    const usernameMock = faker.person.firstName();
    const emailMock = faker.internet.email();
    const tokenMock = faker.string.alphanumeric(10);

    (jwt.sign as jest.Mock).mockImplementationOnce(
      (payload, secret, time, cb) => {
        cb(null, tokenMock);
      },
    );

    (ejs.renderFile as jest.Mock).mockRejectedValueOnce("any");

    await expect(sut.execute(usernameMock)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it("should return bad request error if there is an error generating token", async () => {
    const { sut } = makeSut();
    const usernameMock = faker.person.firstName();
    const emailMock = faker.internet.email();

    (jwt.sign as jest.Mock).mockImplementationOnce(
      (payload, secret, time, cb) => {
        cb(new BadRequestError("error"), null);
      },
    );

    await expect(sut.execute(usernameMock)).rejects.toBeInstanceOf(
      BadRequestError,
    );
    expect(ejs.render).not.toHaveBeenCalled();
  });
});
