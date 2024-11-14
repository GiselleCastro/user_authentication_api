import type { UserRepository } from "../repositories/User";
import type { SendEmailConfirmEmailService } from "./SendEmailConfirmEmail";
import type { GenerateRefreshTokenAndAccessTokenService } from "./GenerateRefreshTokenAndAccessToken";
import bcrypt from "bcrypt";
import { BadRequestError, UnauthorizedError } from "../config/BaseError";
import {
  PASSWORD_DO_NOT_MATCH,
  CONFIRM_EMAIL,
  NON_EXISTENT_USER,
} from "../utils/messages";

export class SignInService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly generateRefreshTokenAndAccessTokenService: GenerateRefreshTokenAndAccessTokenService,
    private readonly sendEmailConfirmEmailService: SendEmailConfirmEmailService,
  ) {}
  async execute(login: string, password: string) {
    const user = await this.userRepository.getUserByLogin(login);

    if (!user) {
      throw new BadRequestError(NON_EXISTENT_USER);
    }

    if (!user.confirmed) {
      await this.sendEmailConfirmEmailService.execute(
        user.username,
        user.email,
      );
      throw new UnauthorizedError(CONFIRM_EMAIL);
    }

    const checkPassword = await bcrypt.compare(password, user.password_hash);

    if (!checkPassword) {
      throw new BadRequestError(PASSWORD_DO_NOT_MATCH);
    }

    const refreshTokenAndAccessToken =
      await this.generateRefreshTokenAndAccessTokenService.execute(user.id);
    return refreshTokenAndAccessToken;
  }
}
