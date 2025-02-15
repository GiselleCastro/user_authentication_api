import { name, description, version } from './package.json';
import { constants } from './src/config/constants';
import { Environment } from './src/enum';
import { SwaggerOptions } from '@fastify/swagger';

const { ENVIRONMENT_ENV } = constants;

export const swaggerOptions: SwaggerOptions = {
  swagger: {
    info: {
      title: name,
      description,
      version,
      contact: {
        name: 'Giselle Castro',
        email: 'giselle@fisica.ufc.br',
      },
    },
    consumes: ['application/json'],
    produces: ['application/json'],
    basePath: '',
    securityDefinitions: {
      authorization: {
        description: 'authorization header token, example: "Bearer #TOKEN#"',
        type: 'apiKey',
        name: 'authorization',
        in: 'header',
      },
    },
    //schemes: ["http", "https"],
    //host: "localhost",
  },
};

export const swaggerUiOptions = {
  routePrefix: '/api-docs',
  exposeRoute: ENVIRONMENT_ENV !== Environment.PRODUCTION,
};
