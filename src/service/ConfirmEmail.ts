import type { UserRepository } from "../repositories/User";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { BadRequestError, UnauthorizedError } from "../config/BaseError";
import {
  NON_EXISTENT_USER,
  EMAIL_ALREADY_CONFIRMED,
  INVALID_TOKEN,
} from "../utils/messages";
import { constants } from "../config/constants";

const { SECRET_CONFIRM_EMAIL } = constants;

export class ConfirmEmailService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(token: string) {
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
}
