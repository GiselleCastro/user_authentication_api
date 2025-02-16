import type { UserRepository } from '../repositories/User';
import { BadRequestError } from '../config/BaseError';
import { NON_EXISTENT_USER, PASSWORD_INCORRECT } from '../utils/messages';
import { UUID } from '../@types';
import bcrypt from 'bcrypt';

export class DeleteUserService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: UUID, password: string) {
    const userRegister = await this.userRepository.getUserById(userId);

    if (!userRegister) {
      throw new BadRequestError(NON_EXISTENT_USER);
    }

    const checkPassword = await bcrypt.compare(password, userRegister.password_hash);

    if (checkPassword) {
      await this.userRepository.deleteUser(userId);
    } else {
      throw new BadRequestError(PASSWORD_INCORRECT);
    }
  }
}
