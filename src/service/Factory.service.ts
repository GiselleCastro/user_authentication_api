import { UserRepository } from "../repositories/User";
import { TokenToResetPasswordRepository } from "../repositories/TokenToResetPassword";

import { UserService } from "./User";
import { SendEmailService } from "./SendEmail";
import { GenerateTokenService } from "./GenerateToken";

export class GenerateTokenServiceFactory {
  static make(): GenerateTokenService {
    const userRepository = new UserRepository();
    const emailService = new SendEmailService();
    return new GenerateTokenService(userRepository, emailService);
  }
}

export class UserServiceFactory {
  static make(): UserService {
    const userRepository = new UserRepository();
    const sendEmailService = new SendEmailService();
    const tokenToResetPasswordRepository = new TokenToResetPasswordRepository();
    return new UserService(
      userRepository,
      sendEmailService,
      tokenToResetPasswordRepository,
    );
  }
}
