import { db } from "../database/knex";
import { BaseEntity } from "../config/BaseEntity";

export class TokenToResetPasswordRepository extends BaseEntity {
  async saveToken(login: string, token: string) {
    return db("password_resets")
      .insert({
        login,
        token,
      })
      .catch((error) => {
        this.logger.error(this.saveToken.name, error, {
          login,
        });
        this.handlerError.unprocessableEntityError(this.saveToken.name);
      });
  }

  async deleteToken(info: string) {
    return db("password_resets")
      .where(db.raw('LOWER("login")'), "=", info.toLowerCase())
      .orWhere("token", "=", info)
      .delete()
      .catch((error) => {
        this.logger.error(this.deleteToken.name, error, {
          info,
        });
        this.handlerError.unprocessableEntityError(this.deleteToken.name);
      });
  }

  async getLoginByToken(token: string) {
    return db("password_resets")
      .select("login")
      .where("token", "=", token)
      .then((result) => result[0])
      .catch((error) => {
        this.logger.error(this.getLoginByToken.name, error, {
          token,
        });
        this.handlerError.unprocessableEntityError(this.getLoginByToken.name);
      });
  }
}
