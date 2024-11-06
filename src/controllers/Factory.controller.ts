import { ChangePasswordController } from "./ChangePassword";
import { CreateUserController } from "./CreateUser";
import { LoginController } from "./Login";
import { ResetPasswordController } from "./ResetPassword";
import { ConfirmEmailController } from "./ConfirmEmail";
import { SendEmailResetPasswordController } from "./SendEmailResetPassword";
import * as factory from "../service/Factory.service";

class ChangePasswordControllerFactory {
  static make(): ChangePasswordController {
    const changePassowrdService = factory.ChangePassowrdServiceFactory.make();
    return new ChangePasswordController(changePassowrdService);
  }
}
export const changePasswordController = ChangePasswordControllerFactory.make();

class CreateUserControllerFactory {
  static make(): CreateUserController {
    const createUserService = factory.CreateUserServiceFactory.make();
    return new CreateUserController(createUserService);
  }
}
export const createUserController = CreateUserControllerFactory.make();

class LoginControllerControllerFactory {
  static make(): LoginController {
    const generateTokenService = factory.SignInServiceFactory.make();
    return new LoginController(generateTokenService);
  }
}
export const loginControllerController =
  LoginControllerControllerFactory.make();

class ResetPasswordControllerFactory {
  static make(): ResetPasswordController {
    const resetPasswordService = factory.ResetPasswordServiceFactory.make();
    return new ResetPasswordController(resetPasswordService);
  }
}
export const resetPasswordController = ResetPasswordControllerFactory.make();

class ConfirmEmailControllerFactory {
  static make(): ConfirmEmailController {
    const confirmEmailService = factory.ConfirmEmailServiceFactory.make();
    return new ConfirmEmailController(confirmEmailService);
  }
}
export const confirmEmailController = ConfirmEmailControllerFactory.make();

class SendEmailResetPasswordControllerFactory {
  static make(): SendEmailResetPasswordController {
    const sendEmailResetPasswordService =
      factory.SendEmailResetPasswordServiceFactory.make();
    return new SendEmailResetPasswordController(sendEmailResetPasswordService);
  }
}
export const sendEmailResetPasswordController =
  SendEmailResetPasswordControllerFactory.make();
