import type { FastifyInstance } from "fastify";
import * as middleware from "../middleware/index";
import * as controller from "../controllers/Factory.controller";
import * as types from "../@types";
import * as schemasSwagger from "../docs/swagger";

export const publicRoutes = async (fastify: FastifyInstance) => {
  fastify.post<{
    Body: types.CreateUser;
  }>("/register", {
    schema: schemasSwagger.createUser,
    preHandler: [middleware.validateCreateUserInput],
    handler: controller.createUserController.handler,
  });

  fastify.post<{
    Body: types.Login;
  }>("/login", {
    schema: schemasSwagger.login,
    preHandler: [middleware.validateLoginInput],
    handler: controller.loginControllerController.handler,
  });

  fastify.post<{
    Body: types.LoginToRecoverPassword;
  }>("/forgot-password", {
    schema: schemasSwagger.forgotPassword,
    preHandler: [middleware.validateLoginToRecoverPasswordInput],
    handler: controller.sendEmailResetPasswordController.handler,
  });

  fastify.post<{
    Body: types.NewPassword;
    Querystring: types.Token;
  }>("/reset-password", {
    schema: schemasSwagger.resetPassword,
    preHandler: [
      middleware.validateTokenInput,
      middleware.validateNewPasswordInput,
    ],
    handler: controller.resetPasswordController.handler,
  });

  fastify.get<{
    Querystring: types.Token;
  }>("/confirm-email", {
    schema: schemasSwagger.confirmEmail,
    preHandler: [middleware.validateTokenInput],
    handler: controller.confirmEmailController.handler,
  });
};
