import type { FastifyRequest, FastifyReply } from 'fastify';
import type { SendEmailResetPasswordService } from '../service/SendEmailResetPassword';
import { BaseEntity } from '../config/BaseEntity';
import * as types from '../@types';
import HttpStatusCode from 'http-status-codes';

export class SendEmailResetPasswordController extends BaseEntity {
  constructor(
    private readonly sendEmailResetPasswordService: SendEmailResetPasswordService,
  ) {
    super();
  }

  handler = async (
    request: FastifyRequest<{
      Body: types.LoginToRecoverPassword;
    }>,
    reply: FastifyReply,
  ) => {
    const { login } = request.body;

    try {
      await this.sendEmailResetPasswordService.execute(login);

      return reply.code(HttpStatusCode.NO_CONTENT).send();
    } catch (error) {
      this.handlerErrorController(error, reply, { error });
    }
  };
}
