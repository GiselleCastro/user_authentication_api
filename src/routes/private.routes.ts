import type { FastifyInstance } from "fastify";
import * as controller from "../controllers/Factory.controller";
import * as middleware from "../middleware/index";
import * as types from "../@types";
import * as schemasSwagger from "../docs/swagger";

export const privateRoutes = async (fastify: FastifyInstance) => {
  fastify.addHook("preHandler", middleware.checkAuthetication);

  fastify.patch<{
    Body: types.ChangePassword;
  }>("/change-password", {
    schema: schemasSwagger.changePassword,
    preHandler: [middleware.validateChangePasswordInput],
    handler: controller.changePasswordController.handler,
  });

  fastify.delete("/logout", {
    schema: schemasSwagger.logout,
    handler: controller.logoutController.handler,
  });
};
