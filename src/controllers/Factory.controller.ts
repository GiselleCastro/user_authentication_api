import { LoginController } from "./Login";
import { UserController } from "./User";

import * as factory from "../service/Factory.service";

class LoginControllerControllerFactory {
  static make(): LoginController {
    const generateTokenService = factory.GenerateTokenServiceFactory.make();
    return new LoginController(generateTokenService);
  }
}

export const loginControllerController =
  LoginControllerControllerFactory.make();

class UserControllerFactory {
  static make(): UserController {
    const userService = factory.UserServiceFactory.make();
    return new UserController(userService);
  }
}

export const userController = UserControllerFactory.make();
