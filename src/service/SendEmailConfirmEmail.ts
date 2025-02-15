import ejs from 'ejs';
import path from 'path';
import { SendEmailService } from '../config/EmailSending.config';
import { constants } from '../config/constants';
import { BaseEntity } from '../config/BaseEntity';
import { createToken } from '../utils/createToken';
import { EMAIL_NOT_SENT, EMAIL_TEMPLATE_NOT_RENDERED } from '../utils/messages';

const { SECRET_CONFIRM_EMAIL, EXPIRES_IN_TOKEN_CONFIRM_EMAIL, BASE_URL } = constants;

export class SendEmailConfirmEmailService extends BaseEntity {
  constructor(private readonly sendEmailService: SendEmailService) {
    super();
  }

  async execute(username: string, email: string) {
    const token = await createToken(
      { email },
      SECRET_CONFIRM_EMAIL,
      EXPIRES_IN_TOKEN_CONFIRM_EMAIL,
    );

    await ejs
      .renderFile(path.join(__dirname, '../templates/emailConfirmEmail.ejs'), {
        username: username,
        email: email,
        link: `${BASE_URL}/confirm-email?token=${token}`,
        expiresInMinutes: EXPIRES_IN_TOKEN_CONFIRM_EMAIL / 60,
      })
      .then(async (result) => {
        await this.sendEmailService
          .sendEmail(email, 'Confirm Your Email', result)
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
  }
}
