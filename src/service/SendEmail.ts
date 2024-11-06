import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import randomstring from "randomstring";
import { constants } from "../config/constants";
import { BaseEntity } from "../config/BaseEntity";
import { BadRequestError } from "../config/BaseError";
import { google } from "googleapis";
import { EMAIL_NOT_SENT, EMAIL_TEMPLATE_NOT_RENDERED } from "../utils/messages";

const {
  SENDER_EMAIL_ID,
  SENDER_EMAIL_SECRET,
  SENDER_EMAIL,
  SENDER_REFRESH_TOKEN,
  URL_NEW_ACCESS_TOKENS,
  SECRET_CONFIRM_EMAIL,
  EXPIRES_IN_TOKEN_CONFIRM_EMAIL,
  SECRET_FORGET_PASSWORD,
  EXPIRES_IN_TOKEN_RESET_PASSWORD,
  BASE_URL,
} = constants;

const OAuth2 = google.auth.OAuth2;

const oAuth2Client = new OAuth2(
  SENDER_EMAIL_ID,
  SENDER_EMAIL_SECRET,
  URL_NEW_ACCESS_TOKENS,
);

oAuth2Client.setCredentials({ refresh_token: SENDER_REFRESH_TOKEN });

export class SendEmailService extends BaseEntity {
  private async setTransporter() {
    const accessToken = await oAuth2Client.getAccessToken();
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: SENDER_EMAIL,
        clientId: SENDER_EMAIL_ID,
        clientSecret: SENDER_EMAIL_SECRET,
        refreshToken: SENDER_REFRESH_TOKEN,
        accessToken: accessToken as string,
      },
    });
  }
  private async sendEmail(email: string, mailSubject: string, content: string) {
    const transport = await this.setTransporter();
    transport.set("oauth2_provision_cb", async (user, renew, cb) => {
      try {
        const accessToken = await oAuth2Client.getAccessToken();
        cb(null, accessToken as string);
      } catch (error) {
        cb(error as Error);
      }
    });
    return transport.sendMail(
      {
        from: SENDER_EMAIL,
        to: email,
        subject: mailSubject,
        html: content,
      },
      (error) => {
        this.logger.error(EMAIL_NOT_SENT, error, { email });
        throw new BadRequestError(EMAIL_NOT_SENT);
      },
    );
  }

  async toConfirmEmail(username: string, email: string) {
    const generateToken = () =>
      new Promise((resolve, reject) => {
        jwt.sign(
          { email },
          SECRET_CONFIRM_EMAIL,
          {
            expiresIn: 1800,
          },
          (error, token) => {
            if (error) reject(new BadRequestError(error.name, [error.message]));
            resolve(token);
          },
        );
      });

    const token = await generateToken();

    const templateEmail = await ejs
      .renderFile(path.join(__dirname, "../templates/emailConfirmEmail.ejs"), {
        username: username,
        email: email,
        link: `${BASE_URL}/confirm-email?token=${token}`,
        expiresInMinutes: EXPIRES_IN_TOKEN_CONFIRM_EMAIL / 60,
      })
      .catch((error) => {
        this.logger.error(EMAIL_TEMPLATE_NOT_RENDERED, error, {
          username,
          email,
        });
        throw new BadRequestError(EMAIL_TEMPLATE_NOT_RENDERED);
      });

    await this.sendEmail(email, "Confirm Your Email", templateEmail).catch(
      (error) => {
        this.logger.error(EMAIL_NOT_SENT, error, { username, email });
        throw new BadRequestError(EMAIL_NOT_SENT);
      },
    );
  }

  async toResetPassword(username: string, email: string): Promise<string> {
    const randomString = randomstring.generate(20);
    const generateToken = (): Promise<string> =>
      new Promise((resolve, reject) => {
        jwt.sign(
          { randomString },
          SECRET_FORGET_PASSWORD,
          {
            expiresIn: EXPIRES_IN_TOKEN_RESET_PASSWORD,
          },
          (error, token) => {
            if (error) reject(new BadRequestError(error.name, [error.message]));
            resolve(token as string);
          },
        );
      });

    const token = await generateToken();

    const templateEmail = await ejs
      .renderFile(path.join(__dirname, "../templates/emailResetPassword.ejs"), {
        username: username,
        email: email,
        link: `${BASE_URL}/reset-password?token=${token}`,
        expiresInMinutes: EXPIRES_IN_TOKEN_RESET_PASSWORD / 60,
      })
      .catch((error) => {
        this.logger.error(EMAIL_TEMPLATE_NOT_RENDERED, error, {
          username,
          email,
        });
        throw new BadRequestError(EMAIL_TEMPLATE_NOT_RENDERED);
      });

    await this.sendEmail(
      email,
      "Password Recovery Instructions",
      templateEmail,
    ).catch((error) => {
      this.logger.error(EMAIL_NOT_SENT, error, { username, email });
      throw new BadRequestError(EMAIL_NOT_SENT);
    });

    return token;
  }
}
