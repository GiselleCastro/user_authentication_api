import type { FastifyRequest, FastifyReply } from 'fastify';
import type { DeleteUserService } from '../service/DeleteUser';
import { BaseEntity } from '../config/BaseEntity';
import * as types from '../@types';
import HttpStatusCode from 'http-status-codes';

export class DeleteUserController extends BaseEntity {
  constructor(private readonly deleteUserService: DeleteUserService) {
    super();
  }

  handlerRequest = async (
    request: FastifyRequest<{
      Body: types.Password;
    }> &
      types.Access,
    reply: FastifyReply,
  ) => {
    const userId = request.access?.id as types.UUID;
    const { password } = request.body;

    try {
      await this.deleteUserService.execute(userId, password);
      return reply.code(HttpStatusCode.NO_CONTENT).send();
    } catch (error) {
      this.handlerErrorController(error, reply);
    }
  };
}
