import { UserRepository } from "../repositories/User";
import { TokenToResetPasswordRepository } from "../repositories/TokenToResetPassword";
import { SendEmailService } from "../config/EmailSending.config";

import { ChangePassowrdService } from "./ChangePassword";
import { ConfirmEmailService } from "./ConfirmEmail";
import { CreateUserService } from "./CreateUser";
import { DeleteUserService } from "./DeleteUser";
import { SignInService } from "./SignIn";
import { ResetPasswordService } from "./ResetPassword";
import { SendEmailConfirmEmailService } from "./SendEmailConfirmEmail";
import { SendEmailResetPasswordService } from "./SendEmailResetPassword";

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

export class SignInServiceFactory {
  static make(): SignInService {
    const userRepository = new UserRepository();
    const sendEmailConfirmEmailService =
      SendEmailConfirmEmailServiceFactory.make();
    return new SignInService(userRepository, sendEmailConfirmEmailService);
  }
}

export class ResetPasswordServiceFactory {
  static make(): ResetPasswordService {
    const userRepository = new UserRepository();
    const tokenToResetPasswordRepository = new TokenToResetPasswordRepository();
    return new ResetPasswordService(
      userRepository,
      tokenToResetPasswordRepository,
    );
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
    const tokenToResetPasswordRepository = new TokenToResetPasswordRepository();
    const userRepository = new UserRepository();
    return new SendEmailResetPasswordService(
      sendEmailService,
      tokenToResetPasswordRepository,
      userRepository,
    );
  }
}
