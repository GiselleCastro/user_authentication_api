import { db } from "../database/knex";
import { BaseEntity } from "../config/BaseEntity";
import { UUID } from "../@types";

export class RefreshTokenRepository extends BaseEntity {
  async saveResfreshToken(
    refreshTokenId: UUID,
    userId: UUID,
    refreshTokenHash: string,
    expiresInRefreshToken: string,
  ) {
    return db("refresh_tokens")
      .insert({
        id: refreshTokenId,
        user_id: userId,
        refresh_token_hash: refreshTokenHash,
        expires_in: expiresInRefreshToken,
      })
      .catch((error) => {
        this.logger.error(this.saveResfreshToken.name, error, {
          refreshTokenId,
        });
        this.handlerError.unprocessableEntityError(this.saveResfreshToken.name);
      });
  }

  async deleteRefreshToken(refreshTokenId: UUID) {
    return db("refresh_tokens")
      .where("id", "=", refreshTokenId)
      .delete()
      .catch((error) => {
        this.logger.error(this.deleteRefreshToken.name, error, {
          refreshTokenId,
        });
        this.handlerError.unprocessableEntityError(
          this.deleteRefreshToken.name,
        );
      });
  }

  async getRefreshTokenById(refreshTokenId: UUID) {
    return db("refresh_tokens")
      .select("id", "user_id", "refresh_token_hash")
      .where("id", "=", refreshTokenId)
      .then((result) => result[0])
      .catch((error) => {
        this.logger.error(this.getRefreshTokenById.name, error, {
          refreshTokenId,
        });
        this.handlerError.unprocessableEntityError(
          this.getRefreshTokenById.name,
        );
      });
  }

  async getRefreshTokenByUserId(userId: UUID) {
    return db("refresh_tokens")
      .select("id", "user_id", "refresh_token_hash")
      .where("user_id", "=", userId)
      .then((result) => result[0])
      .catch((error) => {
        this.logger.error(this.getRefreshTokenByUserId.name, error, {
          userId,
        });
        this.handlerError.unprocessableEntityError(
          this.getRefreshTokenByUserId.name,
        );
      });
  }
}
