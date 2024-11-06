import { constants } from "./constants";
import winston from "winston";
import { Environment, LogLevel } from "../enum/index";

const { ENVIRONMENT_ENV, LOGGER_LEVEL, LOGGER_SERVICE_NAME } = constants;

interface DetailsLog extends winston.Logform.TransformableInfo {
  serviceName: string;
  functionName: string;
}

export class WintonConfig {
  private setFormatLogger() {
    if (ENVIRONMENT_ENV.toLowerCase() === Environment.DEVELOPMENT) {
      return winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf((details) => {
          return `${details.timestamp} [${details.serviceName}] ${details.level.toUpperCase()} ${details.functionName} -- ${details.message}`;
        }),
      );
    }

    return winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    );
  }

  createLogger(functionName: string) {
    const levels = Object.values(LogLevel).reduce((acc, level, index) => {
      return { ...acc, [level]: index };
    }, {});

    return winston.createLogger({
      level: LOGGER_LEVEL,
      format: this.setFormatLogger(),
      levels,
      defaultMeta: {
        serviceName: LOGGER_SERVICE_NAME,
        functionName,
      } as DetailsLog,
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: "./logs/.log",
          level: LogLevel.INFO,
        }),
        new winston.transports.File({
          filename: "./logs/errors.log",
          level: LogLevel.ERROR,
        }),
      ],
      exceptionHandlers: [
        new winston.transports.File({ filename: "./logs/exceptions.log" }),
      ],
      exitOnError: false,
    });
  }
}
