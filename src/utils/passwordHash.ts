import { validationPassword } from '../utils/validationPassword';
import bcrypt from 'bcrypt';
import { BadRequestError } from '../config/BaseError';
import { PASSWORD_DO_NOT_MATCH, WEAK_PASSWORD } from './messages';

export const getPasswordHash = async (password: string, confirmPassword: string) => {
  const isStrongPassword = validationPassword(password);

  if (typeof isStrongPassword === 'object') {
    throw new BadRequestError(WEAK_PASSWORD, isStrongPassword);
  }

  const matchPasswords = password === confirmPassword;

  if (!matchPasswords) {
    throw new BadRequestError(PASSWORD_DO_NOT_MATCH);
  }

  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};
