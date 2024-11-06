import nodemailer from "nodemailer";
import { constants } from "./constants";
import { BaseEntity } from "./BaseEntity";
import { BadRequestError } from "./BaseError";
import { google } from "googleapis";
import { EMAIL_NOT_SENT } from "../utils/messages";

const {
  SENDER_EMAIL_ID,
  SENDER_EMAIL_SECRET,
  SENDER_EMAIL,
  SENDER_REFRESH_TOKEN,
  URL_NEW_ACCESS_TOKENS,
} = constants;

const OAuth2 = google.auth.OAuth2;

const oAuth2Client = new OAuth2(
  SENDER_EMAIL_ID,
  SENDER_EMAIL_SECRET,
  URL_NEW_ACCESS_TOKENS,
);

oAuth2Client.setCredentials({ refresh_token: SENDER_REFRESH_TOKEN });

export class SendEmailService extends BaseEntity {
  protected async setTransporter() {
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
}
