import { ChangePasswordController } from './ChangePassword';
import { CreateUserController } from './CreateUser';
import { LoginController } from './Login';
import { ResetPasswordController } from './ResetPassword';
import { ConfirmEmailController } from './ConfirmEmail';
import { SendEmailResetPasswordController } from './SendEmailResetPassword';
import { NewAccessTokenAndRefreshTokenController } from './NewAccessTokenAndRefreshToken';
import { LogoutController } from './Logout';
import { DeleteUserController } from './DeleteUser';
import * as factory from '../service/Factory.service';

class ChangePasswordControllerFactory {
  static make(): ChangePasswordController {
    const changePassowrdService = factory.ChangePasswordServiceFactory.make();
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

class LoginControllerFactory {
  static make(): LoginController {
    const generateTokenService = factory.SignInServiceFactory.make();
    return new LoginController(generateTokenService);
  }
}
export const loginController = LoginControllerFactory.make();

class LogoutControllerFactory {
  static make(): LogoutController {
    const invalidateRefreshTokenService =
      factory.InvalidateRefreshTokenServiceFactory.make();
    return new LogoutController(invalidateRefreshTokenService);
  }
}
export const logoutController = LogoutControllerFactory.make();

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

class NewAccessTokenAndRefreshTokenControllerFactory {
  static make(): NewAccessTokenAndRefreshTokenController {
    const generateRefreshTokenAndAccessTokenService =
      factory.GenerateRefreshTokenAndAccessTokenServiceFactory.make();
    return new NewAccessTokenAndRefreshTokenController(
      generateRefreshTokenAndAccessTokenService,
    );
  }
}
export const newAccessTokenAndRefreshTokenController =
  NewAccessTokenAndRefreshTokenControllerFactory.make();

export class DeleteUserControllerFactory {
  static make(): DeleteUserController {
    const deleteUserService = factory.DeleteUserServiceFactory.make();
    return new DeleteUserController(deleteUserService);
  }
}

export const deleteUserController = DeleteUserControllerFactory.make();
