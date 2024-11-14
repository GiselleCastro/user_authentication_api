import { db } from "../database/knex";
import { v4 as uuid } from "uuid";
import { UUID } from "../@types";
import { BaseEntity } from "../config/BaseEntity";

export class UserRepository extends BaseEntity {
  async createUser(username: string, email: string, passwordHash: string) {
    return db("users")
      .insert({
        id: uuid(),
        username,
        email,
        password_hash: passwordHash,
      })
      .catch((error) => {
        this.logger.error(this.createUser.name, error, {
          username,
          email,
        });
        this.handlerError.unprocessableEntityError(this.createUser.name);
      });
  }

  async getUserById(
    userId: UUID,
  ): Promise<
    | { id: UUID; email: string; confirmed: boolean; password_hash: string }
    | undefined
  > {
    return db("users")
      .select("id", "email", "confirmed", "password_hash")
      .where("id", "=", userId)
      .then((result) => result[0])
      .catch((error) => {
        this.logger.error(this.getUserById.name, error, {
          userId,
        });
        this.handlerError.unprocessableEntityError(this.getUserById.name);
      });
  }

  async getUserByLogin(login: string): Promise<
    | {
        id: UUID;
        username: string;
        email: string;
        confirmed: boolean;
        password_hash: string;
      }
    | undefined
  > {
    return db("users")
      .select("id", "username", "email", "confirmed", "password_hash")
      .where(db.raw('LOWER("username")'), "=", login.toLowerCase())
      .orWhere(db.raw('LOWER("email")'), "=", login.toLowerCase())
      .then((result) => result[0])
      .catch((error) => {
        this.logger.error(this.getUserByLogin.name, error, {
          login,
        });
        this.handlerError.unprocessableEntityError(this.getUserByLogin.name);
      });
  }

  async getUserByUsernameOrEmail(
    username: string,
    email: string,
  ): Promise<
    { username: string; email: string; confirmed: boolean } | undefined
  > {
    return db("users")
      .select("username", "email", "confirmed")
      .where(db.raw('LOWER("username")'), "=", username.toLowerCase())
      .orWhere(db.raw('LOWER("email")'), "=", email.toLowerCase())
      .then((result) => result[0])
      .catch((error) => {
        this.logger.error(this.getUserByUsernameOrEmail.name, error, {
          username,
          email,
        });
        this.handlerError.unprocessableEntityError(
          this.getUserByUsernameOrEmail.name,
        );
      });
  }

  async deleteUser(userId: UUID) {
    return db("users")
      .where("id", "=", userId)
      .delete()
      .catch((error) => {
        this.logger.error(this.deleteUser.name, error, {
          userId,
        });
        this.handlerError.unprocessableEntityError(this.deleteUser.name);
      });
  }

  async updatePassword(login: string, passwordHash: string) {
    return db("users")
      .where(db.raw('LOWER("username")'), "=", login.toLowerCase())
      .orWhere(db.raw('LOWER("email")'), "=", login.toLowerCase())
      .update("password_hash", passwordHash)
      .catch((error) => {
        this.logger.error(this.updatePassword.name, error, {
          login,
        });
        this.handlerError.unprocessableEntityError(this.updatePassword.name);
      });
  }

  async confirmEmail(email: string) {
    return db("users")
      .where(db.raw('LOWER("email")'), "=", email.toLowerCase())
      .update("confirmed", true)
      .catch((error) => {
        this.logger.error(this.confirmEmail.name, error, {
          email,
        });
        this.handlerError.unprocessableEntityError(this.confirmEmail.name);
      });
  }

  async getRoleAndPermissions(userId: UUID) {
    return db("users_roles")
      .join("roles", "roles.id", "users_roles.role_id")
      .join("permissions_roles", "permissions_roles.role_id", "roles.id")
      .join("permissions", "permissions.id", "permissions_roles.permission_id")
      .select("role", "permission")
      .where("user_id", userId)
      .then((result) => {
        if (!result.length) return;

        return {
          role: result[0].role,
          permissions: result.map((i) => i.permission),
        };
      })
      .catch((error) => {
        this.logger.error(this.getRoleAndPermissions.name, error, {
          userId,
        });
        this.handlerError.unprocessableEntityError(
          this.getRoleAndPermissions.name,
        );
      });
  }
}
