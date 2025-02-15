import type { UserRepository } from '../repositories/User';
import { BadRequestError } from '../config/BaseError';
import { NON_EXISTENT_USER } from '../utils/messages';
import { UUID } from '../@types';

export class DeleteUserService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: UUID) {
    const numberOfRowDeleted = await this.userRepository.deleteUser(userId);

    if (!numberOfRowDeleted) {
      throw new BadRequestError(NON_EXISTENT_USER);
    }
  }
}
