import { UserRepository } from "../repositories/User";
import { ResetPasswordRepository } from "../repositories/ResetPassword";
import { RefreshTokenRepository } from "../repositories/RefreshToken";
import { SendEmailService } from "../config/EmailSending.config";

import { ChangePassowrdService } from "./ChangePassword";
import { ConfirmEmailService } from "./ConfirmEmail";
import { CreateUserService } from "./CreateUser";
import { DeleteUserService } from "./DeleteUser";
import { SignInService } from "./SignIn";
import { ResetPasswordService } from "./ResetPassword";
import { SendEmailConfirmEmailService } from "./SendEmailConfirmEmail";
import { SendEmailResetPasswordService } from "./SendEmailResetPassword";
import { GenerateRefreshTokenAndAccessTokenService } from "./GenerateRefreshTokenAndAccessToken";

export class ChangePassowrdServiceFactory {
  static make(): ChangePassowrdService {
    const userRepository = new UserRepository();
    return new ChangePassowrdService(userRepository);
  }
}

export class ConfirmEmailServiceFactory {
  static make(): ConfirmEmailService {
    const userRepository = new UserRepository();
    return new ConfirmEmailService(userRepository);
  }
}

export class CreateUserServiceFactory {
  static make(): CreateUserService {
    const userRepository = new UserRepository();
    const sendEmailConfirmEmailService =
      SendEmailConfirmEmailServiceFactory.make();
    return new CreateUserService(userRepository, sendEmailConfirmEmailService);
  }
}

export class DeleteUserServiceFactory {
  static make(): DeleteUserService {
    const userRepository = new UserRepository();
    return new DeleteUserService(userRepository);
  }
}

export class GenerateRefreshTokenAndAccessTokenServiceFactory {
  static make(): GenerateRefreshTokenAndAccessTokenService {
    const userRepository = new UserRepository();
    const refreshTokenRepository = new RefreshTokenRepository();
    return new GenerateRefreshTokenAndAccessTokenService(
      userRepository,
      refreshTokenRepository,
    );
  }
}

export class SignInServiceFactory {
  static make(): SignInService {
    const userRepository = new UserRepository();
    const generateRefreshTokenAndAccessTokenService =
      GenerateRefreshTokenAndAccessTokenServiceFactory.make();
    const sendEmailConfirmEmailService =
      SendEmailConfirmEmailServiceFactory.make();
    return new SignInService(
      userRepository,
      generateRefreshTokenAndAccessTokenService,
      sendEmailConfirmEmailService,
    );
  }
}

export class ResetPasswordServiceFactory {
  static make(): ResetPasswordService {
    const userRepository = new UserRepository();
    const resetPasswordRepository = new ResetPasswordRepository();
    return new ResetPasswordService(userRepository, resetPasswordRepository);
  }
}
export class SendEmailConfirmEmailServiceFactory {
  static make(): SendEmailConfirmEmailService {
    const sendEmailService = new SendEmailService();
    return new SendEmailConfirmEmailService(sendEmailService);
  }
}
export class SendEmailResetPasswordServiceFactory {
  static make(): SendEmailResetPasswordService {
    const sendEmailService = new SendEmailService();
    const resetPasswordRepository = new ResetPasswordRepository();
    const userRepository = new UserRepository();
    return new SendEmailResetPasswordService(
      sendEmailService,
      resetPasswordRepository,
      userRepository,
    );
  }
}
