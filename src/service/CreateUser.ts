import type { UserRepository } from "../repositories/User";
import type { SendEmailConfirmEmailService } from "./SendEmailConfirmEmail";
import { getPasswordHash } from "../utils/passwordHash";
import { BadRequestError, UnauthorizedError } from "../config/BaseError";
import { USER_ALREADY_REGISTERED, CONFIRM_EMAIL } from "../utils/messages";

export class CreateUserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sendEmailConfirmEmail: SendEmailConfirmEmailService,
  ) {}

  async execute(
    username: string,
    email: string,
    password: string,
    confirmPassword: string,
  ) {
    const userRegister = await this.userRepository.getUserByUsernameOrEmail(
      username,
      email,
    );

    if (!!userRegister && userRegister.confirmed) {
      throw new BadRequestError(USER_ALREADY_REGISTERED);
    }

    if (!!userRegister && !userRegister.confirmed) {
      await this.sendEmailConfirmEmail.execute(username, email);
      throw new UnauthorizedError(
        `${USER_ALREADY_REGISTERED} - ${CONFIRM_EMAIL}`,
      );
    }

    const passwordHash = await getPasswordHash(password, confirmPassword);

    await this.userRepository.createUser(username, email, passwordHash);
    await this.sendEmailConfirmEmail.execute(username, email);
  }
}
