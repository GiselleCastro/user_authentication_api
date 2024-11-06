import { db } from "../database/knex";
import { BaseEntity } from "../config/BaseEntity";
import { handlerErrorDB } from "../utils/handlerErrorDB";

export class TokenToResetPasswordRepository extends BaseEntity {
  async saveToken(login: string, token: string) {
    return db("password_resets")
      .insert({
        login,
        token,
      })
      .catch((error) =>
        handlerErrorDB(this.saveToken.name, error, this.logger, {
          login,
        }),
      );
  }

  async deleteToken(info: string) {
    return db("password_resets")
      .where(db.raw('LOWER("login")'), "=", info.toLowerCase())
      .orWhere("token", "=", info)
      .delete()
      .catch((error) =>
        handlerErrorDB(this.deleteToken.name, error, this.logger, {
          info,
        }),
      );
  }

  async getLoginByToken(token: string) {
    return db("password_resets")
      .select("login")
      .where("token", "=", token)
      .then((result) => result[0])
      .catch((error) =>
        handlerErrorDB(this.getLoginByToken.name, error, this.logger, {
          token,
        }),
      );
  }
}
