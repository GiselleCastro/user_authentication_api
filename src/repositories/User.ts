import { db } from "../database/knex";
import { v4 as uuid } from "uuid";
import { handlerErrorDB } from "../utils/handlerErrorDB";
import { UUID } from "../@types";
import { BaseEntity } from "../config/BaseEntity";

export class UserRepository extends BaseEntity {
  async createUser(username: string, email: string, passwordHash: string) {
    return db("users")
      .insert({
        id: uuid(),
        username,
        email,
        passwordHash,
      })
      .catch((error) =>
        handlerErrorDB(this.createUser.name, error, this.logger, {
          username,
          email,
        }),
      );
  }

  async getUserById(
    userId: UUID,
  ): Promise<{ id: UUID; email: string; passwordHash: string } | undefined> {
    return db("users")
      .select("id", "email", "passwordHash")
      .where("id", "=", userId)
      .then((result) => result[0])
      .catch((error) =>
        handlerErrorDB(this.getUserById.name, error, this.logger, {
          userId,
        }),
      );
  }

  async getUserByLogin(login: string): Promise<
    | {
        id: UUID;
        username: string;
        email: string;
        confirmed: boolean;
        passwordHash: string;
      }
    | undefined
  > {
    return db("users")
      .select("id", "username", "email", "confirmed", "passwordHash")
      .where(db.raw('LOWER("username")'), "=", login.toLowerCase())
      .orWhere(db.raw('LOWER("email")'), "=", login.toLowerCase())
      .then((result) => result[0])
      .catch((error) =>
        handlerErrorDB(this.getUserByLogin.name, error, this.logger),
      );
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
      .catch((error) =>
        handlerErrorDB(this.getUserByUsernameOrEmail.name, error, this.logger),
      );
  }

  async deleteUser(userId: UUID): Promise<number> {
    return db("users")
      .where("id", "=", userId)
      .delete()
      .catch((error) =>
        handlerErrorDB(this.deleteUser.name, error, this.logger, {
          userId,
        }),
      );
  }

  async updatePassword(login: string, passwordHash: string) {
    return db("users")
      .where(db.raw('LOWER("username")'), "=", login.toLowerCase())
      .orWhere(db.raw('LOWER("email")'), "=", login.toLowerCase())
      .update("passwordHash", passwordHash)
      .catch((error) =>
        handlerErrorDB(this.updatePassword.name, error, this.logger, {
          login,
        }),
      );
  }

  async confirmEmail(email: string) {
    return db("users")
      .where(db.raw('LOWER("email")'), "=", email.toLowerCase())
      .update("confirmed", true)
      .catch((error) =>
        handlerErrorDB(this.confirmEmail.name, error, this.logger, {
          email,
        }),
      );
  }

  async getRoleAndPermissions(
    userId: UUID,
  ): Promise<{ role: string; permissions: string[] } | null> {
    const userAccessControl = await db("users_roles")
      .join("roles", "roles.id", "users_roles.role_id")
      .join("permissions_roles", "permissions_roles.role_id", "roles.id")
      .join("permissions", "permissions.id", "permissions_roles.permission_id")
      .select("role", "permission")
      .where("user_id", userId)
      .then((result) => result)
      .catch((error) =>
        handlerErrorDB(this.getRoleAndPermissions.name, error, this.logger, {
          userId,
        }),
      );

    if (!userAccessControl.length) return null;

    return {
      role: userAccessControl[0].role,
      permissions: userAccessControl.map((i) => i.permission),
    };
  }
}
