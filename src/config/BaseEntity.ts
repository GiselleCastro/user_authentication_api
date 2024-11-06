import { Logger } from "./Logger";

export abstract class BaseEntity {
  protected readonly logger: Logger;
  constructor() {
    this.logger = new Logger(this.constructor.name);
  }
}
