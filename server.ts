import type { FastifyInstance } from "fastify";
import { publicRoutes } from "./src/routes/public.routes";
import { privateRoutes } from "./src/routes/private.routes";
import { constants } from "./src/config/constants";
import { swaggerOptions, swaggerUiOptions } from "./swaggerOptions";
import { Environment } from "./src/enum";
import Fastify from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

const { ENVIRONMENT_ENV } = constants;

const { PORT } = constants;

export const buildServer = () => {
  const server: FastifyInstance = Fastify({
    logger: ENVIRONMENT_ENV === Environment.DEVELOPMENT,
  });

  server.register(fastifySwagger, swaggerOptions);
  server.register(fastifySwaggerUi, swaggerUiOptions);

  server.register(privateRoutes, {
    prefix: "/my-account",
    logLevel: "warn",
  });
  server.register(publicRoutes, { logLevel: "debug" });

  return server;
};

export const server = buildServer();

(async () => {
  try {
    await server.listen({ port: PORT });
    server.log.info(`Server listening at http://localhost:${PORT}`);
    server.log.info(
      `Swagger Documentation >>> http://localhost:${PORT}${swaggerUiOptions.routePrefix}`,
    );
  } catch (error) {
    server.log.error(error);
  }
})();

server.ready();
