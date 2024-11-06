import { SendEmailService } from "../../../src/service/SendEmail";
import { faker } from "@faker-js/faker/.";
import { BadRequestError } from "../../../src/utils/errors";
import jwt from "jsonwebtoken";
import ejs from "ejs";

jest.mock("ejs");
jest.mock("jsonwebtoken");

const makeSut = () => {
  const sut = new SendEmailService();
  return { sut };
};

describe("SendEmailService", () => {
  describe("toResetPassword method", () => {
    it("Email to reset password sent successfully", async () => {
      const { sut } = makeSut();
      const usernameMock = faker.person.firstName();
      const emailMock = faker.internet.email();
      const tokenMock = faker.string.alphanumeric(10);

      (jwt.sign as jest.Mock).mockImplementationOnce(
        (payload, secret, time, cb) => {
          cb(null, tokenMock);
        },
      );

      (ejs.renderFile as jest.Mock).mockResolvedValue("any");

      jest.spyOn(sut, "sendEmail").mockResolvedValue("any");

      expect(await sut.toResetPassword(usernameMock, emailMock)).toEqual(
        tokenMock,
      );
      expect(ejs.renderFile).toHaveBeenCalled();
    });

    it("should return bad request error if there is an error sending email", async () => {
      const { sut } = makeSut();
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
        .spyOn(sut, "sendEmail")
        .mockRejectedValueOnce(async () => new BadRequestError("error"));

      await expect(
        sut.toResetPassword(usernameMock, emailMock),
      ).rejects.toBeInstanceOf(BadRequestError);
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

      await expect(
        sut.toResetPassword(usernameMock, emailMock),
      ).rejects.toBeInstanceOf(BadRequestError);
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

      await expect(
        sut.toResetPassword(usernameMock, emailMock),
      ).rejects.toBeInstanceOf(BadRequestError);
      expect(ejs.render).not.toHaveBeenCalled();
    });
  });

  describe("toConfirmEmail method", () => {
    it("Email to confirm email sent successfully", async () => {
      const { sut } = makeSut();
      const usernameMock = faker.person.firstName();
      const emailMock = faker.internet.email();
      const tokenMock = faker.string.alphanumeric(10);

      (jwt.sign as jest.Mock).mockImplementationOnce(
        (payload, secret, time, cb) => {
          cb(null, tokenMock);
        },
      );

      (ejs.renderFile as jest.Mock).mockResolvedValue("any");

      jest.spyOn(sut, "sendEmail").mockResolvedValue("any");

      expect(await sut.toConfirmEmail(usernameMock, emailMock)).toBeUndefined();
      expect(ejs.renderFile).toHaveBeenCalled();
    });

    it("should return bad request error if there is an error sending email", async () => {
      const { sut } = makeSut();
      const usernameMock = faker.person.firstName();
      const emailMock = faker.internet.email();
      const tokenMock = faker.string.alphanumeric(10);

      (jwt.sign as jest.Mock).mockImplementationOnce(
        (payload, secret, time, cb) => {
          cb(null, tokenMock);
        },
      );

      jest
        .spyOn(sut as any, "sendEmail")
        .mockRejectedValueOnce(async () => new BadRequestError("error"));

      (ejs.renderFile as jest.Mock).mockResolvedValue("any");

      await expect(
        sut.toConfirmEmail(usernameMock, emailMock),
      ).rejects.toBeInstanceOf(BadRequestError);
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

      await expect(
        sut.toConfirmEmail(usernameMock, emailMock),
      ).rejects.toBeInstanceOf(BadRequestError);
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

      await expect(
        sut.toConfirmEmail(usernameMock, emailMock),
      ).rejects.toBeInstanceOf(BadRequestError);
      expect(ejs.renderFile).not.toHaveBeenCalled();
    });
  });
});
