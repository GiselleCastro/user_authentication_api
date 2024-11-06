import winston from "winston";
import { WintonConfig } from "./Winton.config";

export class Logger {
  private readonly logger: winston.Logger;

  constructor(functionName: string) {
    this.logger = new WintonConfig().createLogger(functionName);
  }

  debug(message: string, context?: object) {
    this.logger.debug({ message, context });
  }

  info(message: string, context?: object) {
    this.logger.info({ message, context });
  }

  warn(message: string, context?: object) {
    this.logger.warn({ message, context });
  }

  error(message: string, error: unknown, context?: object) {
    this.logger.error({ message, error, context });
  }
}
