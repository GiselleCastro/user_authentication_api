import type { ResetPasswordRepository } from "../repositories/ResetPassword";
import type { UserRepository } from "../repositories/User";
import { getPasswordHash } from "../utils/passwordHash";
import {
  UnauthorizedError,
  UnprocessableEntityError,
} from "../config/BaseError";
import { EXPIRED_TOKEN, TOKEN_ALREADY_USED } from "../utils/messages";
import { constants } from "../config/constants";
import { validationToken } from "../utils/validationToken";
import { UUID } from "../@types";

const { SECRET_FORGET_PASSWORD } = constants;

export class ResetPasswordService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly resetPasswordRepository: ResetPasswordRepository,
  ) {}

  async execute(token: string, password: string, confirmPassword: string) {
    const decode = await validationToken(token, SECRET_FORGET_PASSWORD);

    if (
      typeof decode === "object" &&
      decode !== null &&
      "id" in decode &&
      typeof decode.id === "string"
    ) {
      const tokenAndLoginByUserId =
        await this.resetPasswordRepository.getTokenAndLoginByUserId(
          decode.id as unknown as UUID,
        );

      if (tokenAndLoginByUserId?.token !== token)
        throw new UnprocessableEntityError(TOKEN_ALREADY_USED);

      const passwordHash = await getPasswordHash(password, confirmPassword);

      await this.userRepository.updatePassword(
        tokenAndLoginByUserId.login,
        passwordHash,
      );

      await this.resetPasswordRepository.deleteToken(
        decode.id as unknown as UUID,
      );
    } else {
      throw new UnauthorizedError(EXPIRED_TOKEN);
    }
  }
}
