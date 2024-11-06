import { SendEmailService } from "../../../src/config/EmailSending.config";
import { SendEmailConfirmEmailService } from "../../../src/service/SendEmailConfirmEmail";
import { faker } from "@faker-js/faker";
import { BadRequestError } from "../../../src/config/BaseError";
import jwt from "jsonwebtoken";
import ejs from "ejs";

jest.mock("ejs");
jest.mock("jsonwebtoken");

const makeSut = () => {
  const sendEmailServiceStub = new SendEmailService();
  const sut = new SendEmailConfirmEmailService(sendEmailServiceStub);
  return { sut, sendEmailServiceStub };
};

describe("SendEmailConfirmEmailService", () => {
  it("Email to confirm email sent successfully", async () => {
    const { sut, sendEmailServiceStub } = makeSut();
    const usernameMock = faker.person.firstName();
    const emailMock = faker.internet.email();
    const tokenMock = faker.string.alphanumeric(10);

    (jwt.sign as jest.Mock).mockImplementationOnce(
      (payload, secret, time, cb) => {
        cb(null, tokenMock);
      },
    );

    (ejs.renderFile as jest.Mock).mockImplementationOnce(async () => {});

    jest.spyOn(sendEmailServiceStub, "sendEmail").mockResolvedValue();

    expect(await sut.execute(usernameMock, emailMock)).toBeUndefined();
    expect(ejs.renderFile).toHaveBeenCalled();
  });

  it("should return bad request error if there is an error sending email", async () => {
    const { sut, sendEmailServiceStub } = makeSut();
    const usernameMock = faker.person.firstName();
    const emailMock = faker.internet.email();
    const tokenMock = faker.string.alphanumeric(10);

    (jwt.sign as jest.Mock).mockImplementationOnce(
      (payload, secret, time, cb) => {
        cb(null, tokenMock);
      },
    );

    jest
      .spyOn(sendEmailServiceStub as any, "sendEmail")
      .mockRejectedValueOnce(async () => new BadRequestError("error"));

    (ejs.renderFile as jest.Mock).mockResolvedValue("any");

    await expect(sut.execute(usernameMock, emailMock)).rejects.toBeInstanceOf(
      BadRequestError,
    );
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

    await expect(sut.execute(usernameMock, emailMock)).rejects.toBeInstanceOf(
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

    await expect(sut.execute(usernameMock, emailMock)).rejects.toBeInstanceOf(
      BadRequestError,
    );
    expect(ejs.renderFile).not.toHaveBeenCalled();
  });
});
