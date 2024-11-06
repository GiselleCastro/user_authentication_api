import jwt from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import randomstring from "randomstring";
import { SendEmailService } from "../config/EmailSending.config";
import { TokenToResetPasswordRepository } from "../repositories/TokenToResetPassword";
import { UserRepository } from "../repositories/User";
import { constants } from "../config/constants";
import { BaseEntity } from "../config/BaseEntity";
import { BadRequestError } from "../config/BaseError";
import { createToken } from "../utils/createToken";
import {
  EMAIL_NOT_SENT,
  EMAIL_TEMPLATE_NOT_RENDERED,
  NON_EXISTENT_USER,
} from "../utils/messages";

const { SECRET_FORGET_PASSWORD, EXPIRES_IN_TOKEN_RESET_PASSWORD, BASE_URL } =
  constants;

export class SendEmailResetPasswordService extends BaseEntity {
  constructor(
    private readonly sendEmailService: SendEmailService,
    private readonly tokenToResetPasswordRepository: TokenToResetPasswordRepository,
    private readonly userRepository: UserRepository,
  ) {
    super();
  }

  async execute(login: string) {
    const user = await this.userRepository.getUserByLogin(login);

    if (!user) {
      throw new BadRequestError(NON_EXISTENT_USER);
    }

    const tokenSent = await this.sendEmailToResetPassword(
      user.username,
      user.email,
    );

    await this.tokenToResetPasswordRepository.deleteToken(login);

    await this.tokenToResetPasswordRepository.saveToken(login, tokenSent);
  }

  private async sendEmailToResetPassword(
    username: string,
    email: string,
  ): Promise<string> {
    const randomString = randomstring.generate(20);

    const token = await createToken(
      { randomString },
      SECRET_FORGET_PASSWORD,
      EXPIRES_IN_TOKEN_RESET_PASSWORD,
    );

    await ejs
      .renderFile(path.join(__dirname, "../templates/emailResetPassword.ejs"), {
        username: username,
        email: email,
        link: `${BASE_URL}/reset-password?token=${token}`,
        expiresInMinutes: EXPIRES_IN_TOKEN_RESET_PASSWORD / 60,
      })
      .then(async (result) => {
        await this.sendEmailService
          .sendEmail(email, "Password Recovery Instructions", result)
          .catch((error) => {
            this.logger.error(EMAIL_NOT_SENT, error, { username, email });
            this.handlerError.badRequestError(EMAIL_NOT_SENT);
          });
      })
      .catch((error) => {
        this.logger.error(EMAIL_TEMPLATE_NOT_RENDERED, error, {
          username,
          email,
        });
        this.handlerError.badRequestError(EMAIL_TEMPLATE_NOT_RENDERED);
      });

    return token;
  }
}
