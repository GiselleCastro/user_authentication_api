import type { FastifyInstance } from 'fastify/types/instance';
import { DeleteUserService } from '../../../src/service/DeleteUser';
import { CheckAutheticationMiddleware } from '../../../src/middleware/CheckAuthetication';
import { server } from '../../../src/server';
import { faker } from '@faker-js/faker';
import { BadRequestError } from '../../../src/config/BaseError';
import { UUID } from '../../../src/@types';
import HttpStatusCode from 'http-status-codes';

jest.mock('../../../src/middleware/CheckAuthetication');
jest.mock('../../../src/service/DeleteUser');

describe('DELETE /my-account/delete-account', () => {
  let serverStub: FastifyInstance;

  beforeAll(async () => {
    serverStub = server;
  });

  afterAll(async () => {
    await serverStub.close();
  });

  it('Account deleted successfully', async () => {
    const tokenQuery = faker.string.alphanumeric(10);
    const password = faker.string.alphanumeric(10);
    const userId = faker.string.uuid() as unknown as UUID;

    const checkAutheticationMiddlewareSpy = jest
      .spyOn(CheckAutheticationMiddleware.prototype, 'handle')
      .mockImplementationOnce(async (request) => {
        request.access = {
          id: userId,
          role: '',
          permissions: [''],
        };
      });

    const deleteUserServiceSpy = jest
      .spyOn(DeleteUserService.prototype, 'execute')
      .mockImplementationOnce(async () => {});

    const response = await serverStub.inject({
      method: 'DELETE',
      url: '/my-account/delete-account',
      payload: { password },
      headers: {
        authorization: `Bearer ${tokenQuery}`,
      },
    });

    expect(response.statusCode).toBe(HttpStatusCode.NO_CONTENT);
    expect(response.body).toBe('');
    expect(deleteUserServiceSpy).toHaveBeenCalledWith(userId, password);

    checkAutheticationMiddlewareSpy.mockRestore();
    deleteUserServiceSpy.mockRestore();
  });

  it('Error delete-account', async () => {
    const tokenQuery = faker.string.alphanumeric(10);
    const password = faker.string.alphanumeric(10);
    const userId = faker.string.uuid() as unknown as UUID;

    const checkAutheticationMiddlewareSpy = jest
      .spyOn(CheckAutheticationMiddleware.prototype, 'handle')
      .mockImplementationOnce(async (request) => {
        request.access = {
          id: userId,
          role: '',
          permissions: [''],
        };
      });

    const messageError = 'error';
    const deleteUserServiceSpy = jest
      .spyOn(DeleteUserService.prototype, 'execute')
      .mockRejectedValue(new BadRequestError(messageError));

    const response = await serverStub.inject({
      method: 'DELETE',
      url: '/my-account/delete-account',
      payload: { password },
      headers: {
        authorization: `Bearer ${tokenQuery}`,
      },
    });

    expect(response.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
    expect(response.headers['content-type']).toBe('application/json; charset=utf-8');
    expect(response.json()).toEqual({ message: messageError });
    expect(deleteUserServiceSpy).toHaveBeenCalledWith(userId, password);

    checkAutheticationMiddlewareSpy.mockRestore();
    deleteUserServiceSpy.mockRestore();
  });
});
