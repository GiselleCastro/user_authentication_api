import type { UserRepository } from '../repositories/User';
import bcrypt from 'bcrypt';
import { getPasswordHash } from '../utils/passwordHash';
import { BadRequestError } from '../config/BaseError';
import { NON_EXISTENT_USER, PASSWORD_INCORRECT } from '../utils/messages';
import { UUID } from '../@types';

export class ChangePasswordService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    userId: UUID,
    password: string,
    newPassword: string,
    confirmNewPassword: string,
  ) {
    const userRegister = await this.userRepository.getUserById(userId);

    if (!userRegister) {
      throw new BadRequestError(NON_EXISTENT_USER);
    }

    const checkPassword = await bcrypt.compare(password, userRegister.password_hash);

    if (checkPassword) {
      const newPasswordHash = await getPasswordHash(newPassword, confirmNewPassword);
      await this.userRepository.updatePassword(userRegister.email, newPasswordHash);
    } else {
      throw new BadRequestError(PASSWORD_INCORRECT);
    }
  }
}
