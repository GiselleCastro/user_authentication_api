import type { UserRepository } from "../repositories/User";
import type { RefreshTokenRepository } from "../repositories/RefreshToken";
import { BadRequestError } from "../config/BaseError";
import { UUID } from "../@types";
import { NON_EXISTENT_USER } from "../utils/messages";

export class InvalidateRefreshTokenService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(userId: UUID) {
    const user = await this.userRepository.getUserById(userId);

    if (!user) {
      throw new BadRequestError(NON_EXISTENT_USER);
    }

    await this.refreshTokenRepository.deleteRefreshTokenByUserId(userId);
  }
}
