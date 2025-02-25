import type { FastifyRequest, FastifyReply } from 'fastify';
import type { SignInService } from '../service/SignIn';
import { Login } from '../@types';
import { BaseEntity } from '../config/BaseEntity';
import HttpStatusCode from 'http-status-codes';

export class LoginController extends BaseEntity {
  constructor(private readonly signInService: SignInService) {
    super();
  }
  handlerRequest = async (
    request: FastifyRequest<{
      Body: Login;
    }>,
    reply: FastifyReply,
  ) => {
    const { login, password } = request.body;

    try {
      const token = await this.signInService.execute(login, password);
      return reply.code(HttpStatusCode.OK).send(token);
    } catch (error) {
      this.handlerErrorController(error, reply);
    }
  };
}
