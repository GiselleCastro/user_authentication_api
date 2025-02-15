import type { UserRepository } from '../repositories/User';
import type { RefreshTokenRepository } from '../repositories/RefreshToken';
import { TokenExpiredError } from 'jsonwebtoken';
import { constants } from '../config/constants';
import { BadRequestError, UnauthorizedError } from '../config/BaseError';
import { TokenJSON, Authorization, UUID, RefresTokenJSON } from '../@types';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { createToken } from '../utils/createToken';
import { validationToken } from '../utils/validationToken';
import { EXPIRED_TOKEN, NON_EXISTENT_USER } from '../utils/messages';

const {
  SECRET_TOKEN_ACCESS,
  EXPIRES_IN_TOKEN_ACCESS,
  SECRET_REFRESH_TOKEN,
  EXPIRES_IN_TOKEN_REFRESH_TOKEN,
} = constants;

export class GenerateRefreshTokenAndAccessTokenService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(userId: UUID, accessToken: string = '', refreshToken: string = '') {
    const user = await this.userRepository.getUserById(userId);

    if (!user) {
      throw new BadRequestError(NON_EXISTENT_USER);
    }

    if (accessToken && refreshToken) {
      const accessTokenDecoded = await validationToken(accessToken, SECRET_TOKEN_ACCESS)
        .then((result) => result as TokenJSON)
        .catch((e) => {
          if (e.message === TokenExpiredError.name) {
            return false;
          }
          throw e;
        });

      if (accessTokenDecoded) {
        return { accessToken };
      }

      const refreshTokenDecoded = (await validationToken(
        refreshToken,
        SECRET_REFRESH_TOKEN,
      )) as RefresTokenJSON;

      const isValidRefreshToken = await this.isValidRefreshToken(
        refreshTokenDecoded?.tokenId as UUID,
        refreshToken,
      );

      if (!isValidRefreshToken) throw new UnauthorizedError(EXPIRED_TOKEN);

      await this.deleteRefreshTokenByRefreshTokenId(refreshTokenDecoded.tokenId as UUID);
    } else {
      await this.deleteRefreshTokenByUserId(userId);
    }

    const refreshTokenAndAccessToken =
      await this.generateRefreshTokenAndAccessToken(userId);

    return refreshTokenAndAccessToken;
  }

  private async generateAccessToken(userId: UUID) {
    const authorization = (await this.userRepository.getRoleAndPermissions(
      userId,
    )) as Authorization;

    const payload: TokenJSON = {
      id: userId,
      app_metadata: {
        authorization,
      },
    };

    const tokenAcess = await createToken(
      payload,
      SECRET_TOKEN_ACCESS,
      EXPIRES_IN_TOKEN_ACCESS,
    );

    return tokenAcess;
  }

  private async generateRefreshTokenAndAccessToken(userId: UUID) {
    const refreshTokenId = uuid() as unknown as UUID;

    const createdAtRefreshToken = Date.now();

    const payload: RefresTokenJSON = {
      tokenId: refreshTokenId,
      id: userId,
      tokenType: 'rt+jwt',
      lastUsedAt: Date.now(),
    };

    const expiresInRefreshToken =
      createdAtRefreshToken + EXPIRES_IN_TOKEN_REFRESH_TOKEN * 1000;

    const refreshToken = await createToken(
      payload,
      SECRET_REFRESH_TOKEN,
      EXPIRES_IN_TOKEN_REFRESH_TOKEN,
    );

    const salt = await bcrypt.genSalt(12);
    const refreshTokenHash = await bcrypt.hash(refreshToken, salt);

    await this.refreshTokenRepository.saveResfreshToken(
      refreshTokenId,
      userId,
      refreshTokenHash,
      new Date(expiresInRefreshToken).toISOString(),
    );

    const accessToken = await this.generateAccessToken(userId);

    return { accessToken, refreshToken };
  }

  private async deleteRefreshTokenByRefreshTokenId(refreshTokenIdOld: UUID) {
    await this.refreshTokenRepository.deleteRefreshTokenByRefreshTokenId(
      refreshTokenIdOld,
    );
  }

  private async deleteRefreshTokenByUserId(userId: UUID) {
    await this.refreshTokenRepository.deleteRefreshTokenByUserId(userId);
  }

  private async isValidRefreshToken(refreshTokenId: UUID, refreshToken: string) {
    const refreshTokenDB =
      await this.refreshTokenRepository.getRefreshTokenById(refreshTokenId);
    if (!refreshTokenDB) throw new BadRequestError(EXPIRED_TOKEN);

    const checkRefreshToken = await bcrypt.compare(
      refreshToken,
      refreshTokenDB.refresh_token_hash,
    );

    return checkRefreshToken;
  }
}
