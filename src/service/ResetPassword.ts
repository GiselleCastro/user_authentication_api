import type { TokenToResetPasswordRepository } from "../repositories/TokenToResetPassword";
import type { UserRepository } from "../repositories/User";
import { getPasswordHash } from "../utils/passwordHash";
import { UnprocessableEntityError } from "../config/BaseError";
import { TOKEN_ALREADY_USED } from "../utils/messages";
import { constants } from "../config/constants";
import { validationToken } from "../utils/validationToken";

const { SECRET_FORGET_PASSWORD } = constants;

export class ResetPasswordService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenToResetPasswordRepository: TokenToResetPasswordRepository,
  ) {}

  async execute(token: string, password: string, confirmPassword: string) {
    await validationToken(token, SECRET_FORGET_PASSWORD);

    const { login } =
      await this.tokenToResetPasswordRepository.getLoginByToken(token);

    if (!login) throw new UnprocessableEntityError(TOKEN_ALREADY_USED);

    const passwordHash = await getPasswordHash(password, confirmPassword);

    await this.userRepository.updatePassword(login, passwordHash);

    await this.tokenToResetPasswordRepository.deleteToken(token);
  }
}
