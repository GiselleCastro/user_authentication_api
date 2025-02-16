import type { FastifyInstance } from 'fastify';
import { publicRoutes } from './routes/public.routes';
import { privateRoutes } from './routes/private.routes';
import { constants } from './config/constants';
import { swaggerOptions, swaggerUiOptions } from '../swaggerOptions';
import { Environment } from './enum';
import Fastify from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

const { ENVIRONMENT_ENV } = constants;

const { SERVER_PORT } = constants;

const buildServer = () => {
  const server: FastifyInstance = Fastify({
    logger: ENVIRONMENT_ENV === Environment.DEVELOPMENT,
  });

  server.register(fastifySwagger, swaggerOptions);
  server.register(fastifySwaggerUi, swaggerUiOptions);

  server.register(privateRoutes, {
    prefix: '/my-account',
    logLevel: 'warn',
  });
  server.register(publicRoutes, { logLevel: 'debug' });

  return server;
};

export const server = buildServer();

(async () => {
  try {
    await server.listen({ port: SERVER_PORT, host: '0.0.0.0' });
    server.log.info(`Server listening at http://localhost:${SERVER_PORT}`);
    server.log.info(
      `Swagger Documentation >>> http://localhost:${SERVER_PORT}${swaggerUiOptions.routePrefix}`,
    );
  } catch (error) {
    server.log.error(error);
  }
})();

server.ready();
