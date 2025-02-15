import type { UserRepository } from '../repositories/User';
import { BadRequestError, UnauthorizedError } from '../config/BaseError';
import {
  NON_EXISTENT_USER,
  EMAIL_ALREADY_CONFIRMED,
  EXPIRED_TOKEN,
} from '../utils/messages';
import { constants } from '../config/constants';
import { validationToken } from '../utils/validationToken';

const { SECRET_CONFIRM_EMAIL } = constants;

export class ConfirmEmailService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(token: string) {
    const decode = await validationToken(token, SECRET_CONFIRM_EMAIL);

    if (
      typeof decode === 'object' &&
      decode !== null &&
      'email' in decode &&
      typeof decode.email === 'string'
    ) {
      const userEmail = decode.email;

      const userRegister = await this.userRepository.getUserByLogin(userEmail);

      if (!userRegister) {
        throw new BadRequestError(NON_EXISTENT_USER);
      }

      if (userRegister.confirmed) {
        throw new BadRequestError(EMAIL_ALREADY_CONFIRMED);
      }

      await this.userRepository.confirmEmail(userEmail);
    } else {
      throw new UnauthorizedError(EXPIRED_TOKEN);
    }
  }
}
