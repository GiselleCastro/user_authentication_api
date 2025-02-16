import type { FastifyInstance } from 'fastify/types/instance';
import { InvalidateRefreshTokenService } from '../../../src/service/InvalidateRefreshToken';
import { CheckAutheticationMiddleware } from '../../../src/middleware/CheckAuthetication';
import { server } from '../../../src/server';
import { faker } from '@faker-js/faker';
import { BadRequestError } from '../../../src/config/BaseError';
import { UUID } from '../../../src/@types';
import HttpStatusCode from 'http-status-codes';

jest.mock('../../../src/middleware/CheckAuthetication');
jest.mock('../../../src/service/InvalidateRefreshToken');

describe('DELETE /my-account/logout', () => {
  let serverStub: FastifyInstance;

  beforeAll(async () => {
    serverStub = server;
  });

  afterAll(async () => {
    await serverStub.close();
  });

  it('Logout successfully', async () => {
    const tokenQuery = faker.string.alphanumeric(10);

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

    const invalidateRefreshTokenServiceSpy = jest
      .spyOn(InvalidateRefreshTokenService.prototype, 'execute')
      .mockImplementationOnce(async () => {});

    const response = await serverStub.inject({
      method: 'DELETE',
      url: '/my-account/logout',
      headers: {
        authorization: `Bearer ${tokenQuery}`,
      },
    });

    expect(response.statusCode).toBe(HttpStatusCode.NO_CONTENT);
    expect(response.body).toBe('');
    expect(invalidateRefreshTokenServiceSpy).toHaveBeenCalledWith(userId);

    checkAutheticationMiddlewareSpy.mockRestore();
    invalidateRefreshTokenServiceSpy.mockRestore();
  });

  it('Error logout', async () => {
    const tokenQuery = faker.string.alphanumeric(10);

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
    const invalidateRefreshTokenServiceSpy = jest
      .spyOn(InvalidateRefreshTokenService.prototype, 'execute')
      .mockRejectedValue(new BadRequestError(messageError));

    const response = await serverStub.inject({
      method: 'DELETE',
      url: '/my-account/logout',
      headers: {
        authorization: `Bearer ${tokenQuery}`,
      },
    });

    expect(response.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
    expect(response.headers['content-type']).toBe('application/json; charset=utf-8');
    expect(response.json()).toEqual({ message: messageError });
    expect(invalidateRefreshTokenServiceSpy).toHaveBeenCalledWith(userId);

    checkAutheticationMiddlewareSpy.mockRestore();
    invalidateRefreshTokenServiceSpy.mockRestore();
  });
});
