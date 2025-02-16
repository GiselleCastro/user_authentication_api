import type { FastifyRequest, FastifyReply } from 'fastify';
import type { GenerateRefreshTokenAndAccessTokenService } from '../service/GenerateRefreshTokenAndAccessToken';
import { BaseEntity } from '../config/BaseEntity';
import * as types from '../@types';
import HttpStatusCode from 'http-status-codes';

export class NewAccessTokenAndRefreshTokenController extends BaseEntity {
  constructor(
    private readonly generateRefreshTokenAndAccessTokenService: GenerateRefreshTokenAndAccessTokenService,
  ) {
    super();
  }
  handlerRequest = async (
    request: FastifyRequest<{
      Body: types.RefreshToken;
    }>,
    reply: FastifyReply,
  ) => {
    const { refreshToken } = request.body;

    try {
      const tokens = await this.generateRefreshTokenAndAccessTokenService.execute({
        refreshToken,
      });
      return reply.code(HttpStatusCode.OK).send(tokens);
    } catch (error) {
      this.handlerErrorController(error, reply);
    }
  };
}
