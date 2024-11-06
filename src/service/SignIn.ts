import type { UserRepository } from "../repositories/User";
import type { SendEmailConfirmEmailService } from "./SendEmailConfirmEmail";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { constants } from "../config/constants";
import { BadRequestError, UnauthorizedError } from "../config/BaseError";
import { TokenJSON, Authorization } from "../@types";
import { createToken } from "../utils/createToken";
import {
  PASSWORD_DO_NOT_MATCH,
  CONFIRM_EMAIL,
  NON_EXISTENT_USER,
} from "../utils/messages";

const { SECRET_TOKEN_ACCESS, EXPIRES_IN_TOKEN_ACCESS } = constants;

export class SignInService {
  constructor(
    private readonly userRepository: UserRepository,
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

    const checkPassword = await bcrypt.compare(password, user.passwordHash);

    if (!checkPassword) {
      throw new BadRequestError(PASSWORD_DO_NOT_MATCH);
    }

    const authorization = (await this.userRepository.getRoleAndPermissions(
      user.id,
    )) as Authorization;

    const payload: TokenJSON = {
      id: user.id,
      app_metadata: {
        authorization,
      },
    };

    const token = await createToken(
      payload,
      SECRET_TOKEN_ACCESS,
      EXPIRES_IN_TOKEN_ACCESS,
    );

    return token;
  }
}