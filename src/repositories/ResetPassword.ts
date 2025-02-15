import { db } from '../database/knex';
import { BaseEntity } from '../config/BaseEntity';
import { UUID } from '../@types';

export class ResetPasswordRepository extends BaseEntity {
  async saveToken(userId: UUID, login: string, token: string) {
    return db('password_resets')
      .insert({
        user_id: userId,
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

  async deleteToken(userId: UUID) {
    return db('password_resets')
      .where('user_id', '=', userId)
      .delete()
      .catch((error) => {
        this.logger.error(this.deleteToken.name, error, {
          userId,
        });
        this.handlerError.unprocessableEntityError(this.deleteToken.name);
      });
  }

  async getTokenAndLoginByUserId(
    userId: UUID,
  ): Promise<{ token: string; login: string } | undefined> {
    return db('password_resets')
      .select('token', 'login')
      .where('user_id', '=', userId)
      .then((result) => result[0])
      .catch((error) => {
        this.logger.error(this.getTokenAndLoginByUserId.name, error, {
          userId,
        });
        this.handlerError.unprocessableEntityError(this.getTokenAndLoginByUserId.name);
      });
  }
}
