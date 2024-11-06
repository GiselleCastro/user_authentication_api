import "dotenv/config";
import type { Environment, LogLevel } from "../enum/index";

export const constants = {
  SERVER_PORT: Number(process.env.SERVER_PORT),
  ENVIRONMENT_ENV: process.env.ENVIRONMENT_ENV as Environment,
  LOGGER_LEVEL: process.env.LOGGER_LEVEL as LogLevel,
  LOGGER_SERVICE_NAME: process.env.LOGGER_SERVICE_NAME as string,
  BASE_URL: process.env.BASE_URL as string,
  SECRET_TOKEN_ACCESS: process.env.SECRET_TOKEN_ACCESS as string,
  EXPIRES_IN_TOKEN_ACCESS: Number(process.env.EXPIRES_IN_TOKEN_ACCESS),
  SECRET_CONFIRM_EMAIL: process.env.SECRET_CONFIRM_EMAIL as string,
  EXPIRES_IN_TOKEN_CONFIRM_EMAIL: Number(
    process.env.EXPIRES_IN_TOKEN_CONFIRM_EMAIL,
  ),
  SECRET_FORGET_PASSWORD: process.env.SECRET_FORGET_PASSWORD as string,
  EXPIRES_IN_TOKEN_RESET_PASSWORD: Number(
    process.env.EXPIRES_IN_TOKEN_RESET_PASSWORD,
  ),
  SENDER_EMAIL_ID: process.env.SENDER_EMAIL_ID as string,
  SENDER_EMAIL: process.env.SENDER_EMAIL as string,
  SENDER_EMAIL_SECRET: process.env.SENDER_EMAIL_SECRET as string,
  SENDER_REFRESH_TOKEN: process.env.SENDER_REFRESH_TOKEN as string,
  URL_NEW_ACCESS_TOKENS: process.env.URL_NEW_ACCESS_TOKENS as string,
};
