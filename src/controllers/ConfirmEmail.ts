import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ConfirmEmailService } from '../service/ConfirmEmail';
import { BaseEntity } from '../config/BaseEntity';
import * as types from '../@types';
import HttpStatusCode from 'http-status-codes';

export class ConfirmEmailController extends BaseEntity {
  constructor(private readonly confirmEmailService: ConfirmEmailService) {
    super();
  }

  handler = async (
    request: FastifyRequest<{
      Querystring: types.Token;
    }>,
    reply: FastifyReply,
  ) => {
    const { token } = request.query;

    try {
      await this.confirmEmailService.execute(token);

      return reply.code(HttpStatusCode.NO_CONTENT).send();
    } catch (error) {
      this.handlerErrorController(error, reply);
    }
  };
}
