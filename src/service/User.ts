import type { TokenToResetPasswordRepository } from "../repositories/TokenToResetPassword";
import type { UserRepository } from "../repositories/User";
import type { SendEmailService } from "./SendEmail";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { getPasswordHash } from "../utils/passwordHash";
import {
  BadRequestError,
  UnauthorizedError,
  UnprocessableEntityError,
} from "../config/BaseError";
import {
  TOKEN_ALREADY_USED,
  NON_EXISTENT_USER,
  USER_ALREADY_REGISTERED,
  CONFIRM_EMAIL,
  EMAIL_ALREADY_CONFIRMED,
  INVALID_TOKEN,
  PASSWORD_INCORRECT,
} from "../utils/messages";
import { UUID } from "../@types";
import { constants } from "../config/constants";

const { SECRET_CONFIRM_EMAIL, SECRET_FORGET_PASSWORD } = constants;

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sendEmailService: SendEmailService,
    private readonly tokenToResetPasswordRepository: TokenToResetPasswordRepository,
  ) {}

  async createUser(
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
      await this.sendEmailService.toConfirmEmail(username, email);
      throw new UnauthorizedError(
        `${USER_ALREADY_REGISTERED} - ${CONFIRM_EMAIL}`,
      );
    }

    const passwordHash = await getPasswordHash(password, confirmPassword);

    await this.userRepository.createUser(username, email, passwordHash);
    await this.sendEmailService.toConfirmEmail(username, email);
  }

  async confirmEmail(token: string) {
    const getToken = () =>
      new Promise((resolve, reject) => {
        jwt.verify(token, SECRET_CONFIRM_EMAIL, (error, decode) => {
          if (error) {
            reject(
              new UnauthorizedError((error as JsonWebTokenError)?.name, [
                (error as JsonWebTokenError)?.message,
              ]),
            );
          }
          resolve(decode);
        });
      });

    const decode = await getToken();

    if (!(decode as jwt.JwtPayload)?.email) {
      throw new BadRequestError(INVALID_TOKEN);
    }

    const userEmail = (decode as jwt.JwtPayload).email;

    const userRegister = await this.userRepository.getUserByLogin(userEmail);

    if (!userRegister) {
      throw new BadRequestError(NON_EXISTENT_USER);
    }

    if (userRegister.confirmed) {
      throw new BadRequestError(EMAIL_ALREADY_CONFIRMED);
    }

    await this.userRepository.confirmEmail(userEmail);
  }

  async sendEmailToResetPassword(login: string) {
    const user = await this.userRepository.getUserByLogin(login);

    if (!user) {
      throw new BadRequestError(NON_EXISTENT_USER);
    }

    const tokenSent = await this.sendEmailService.toResetPassword(
      user.username,
      user.email,
    );

    await this.tokenToResetPasswordRepository.deleteToken(login);

    await this.tokenToResetPasswordRepository.saveToken(login, tokenSent);
  }

  async changePassword(
    userId: UUID,
    password: string,
    newPassword: string,
    confirmNewPassword: string,
  ) {
    const userRegister = await this.userRepository.getUserById(userId);

    if (!userRegister) {
      throw new BadRequestError(NON_EXISTENT_USER);
    }

    const checkPassword = await bcrypt.compare(
      password,
      userRegister.passwordHash,
    );

    if (checkPassword) {
      const newPasswordHash = await getPasswordHash(
        newPassword,
        confirmNewPassword,
      );
      await this.userRepository.updatePassword(
        userRegister.email,
        newPasswordHash,
      );
    } else {
      throw new BadRequestError(PASSWORD_INCORRECT);
    }
  }

  async resetPassword(
    token: string,
    password: string,
    confirmPassword: string,
  ) {
    jwt.verify(token, SECRET_FORGET_PASSWORD, (error) => {
      throw new UnauthorizedError((error as JsonWebTokenError).name, [
        (error as JsonWebTokenError).message,
      ]);
    });

    const { login } =
      await this.tokenToResetPasswordRepository.getLoginByToken(token);

    if (!login) throw new UnprocessableEntityError(TOKEN_ALREADY_USED);

    const passwordHash = await getPasswordHash(password, confirmPassword);

    await this.userRepository.updatePassword(login, passwordHash);

    await this.tokenToResetPasswordRepository.deleteToken(token);
  }

  async deleteUser(userId: UUID) {
    const numberOfRowDeleted = await this.userRepository.deleteUser(userId);

    if (!numberOfRowDeleted) {
      throw new BadRequestError(NON_EXISTENT_USER);
    }
  }
}
