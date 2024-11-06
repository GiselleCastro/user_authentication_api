import type { UserRepository } from "../repositories/User";
import type { SendEmailService } from "./SendEmail";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { constants } from "../config/constants";
import { BadRequestError, UnauthorizedError } from "../utils/errors";
import { TokenJSON, Authorization } from "../@types";
import {
  PASSWORD_DO_NOT_MATCH,
  CONFIRM_EMAIL,
  NON_EXISTENT_USER,
} from "../utils/messages";

const { SECRET_TOKEN_ACCESS, EXPIRES_IN_TOKEN_ACCESS } = constants;

export class GenerateTokenService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sendEmailService: SendEmailService,
  ) {}
  async execute(login: string, password: string) {
    const user = await this.userRepository.getUserByLogin(login);

    if (!user) {
      throw new BadRequestError(NON_EXISTENT_USER);
    }

    if (!user.confirmed) {
      await this.sendEmailService.toConfirmEmail(user.username, user.email);
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

    const generateToken = () =>
      new Promise((resolve, reject) => {
        jwt.sign(
          payload,
          SECRET_TOKEN_ACCESS,
          { expiresIn: EXPIRES_IN_TOKEN_ACCESS },
          (error, token) => {
            if (error)
              reject(new UnauthorizedError(error.name, [error.message]));
            resolve(token);
          },
        );
      });

    const token = await generateToken();

    return token;
  }
}