import type { FastifyInstance } from 'fastify/types/instance';
import { ChangePasswordService } from '../../../src/service/ChangePassword';
import { CheckAutheticationMiddleware } from '../../../src/middleware/CheckAuthetication';
import { buildServer } from '../../../src/server';
import { faker } from '@faker-js/faker';
import { BadRequestError } from '../../../src/config/BaseError';
import { UUID } from '../../../src/@types';
import { ERROR_VALIDATION } from '../../../src/utils/messages';
import HttpStatusCode from 'http-status-codes';

jest.mock('../../../src/middleware/CheckAuthetication');
jest.mock('../../../src/service/ChangePassword');

describe('PATCH /my-account/change-password', () => {
  let serverStub: FastifyInstance;

  beforeAll(async () => {
    serverStub = buildServer();
  });

  afterAll(async () => {
    await serverStub.close();
  });

  it('Password updated successfully', async () => {
    const tokenQuery = faker.string.alphanumeric(10);

    const changePasswordInput = {
      password: faker.internet.password(),
      newPassword: faker.internet.password(),
      get confirmNewPassword() {
        return this.newPassword;
      },
    };

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

    const changePasswordServiceSpy = jest
      .spyOn(ChangePasswordService.prototype, 'execute')
      .mockResolvedValue(undefined);

    const response = await serverStub.inject({
      method: 'PATCH',
      url: '/my-account/change-password',
      payload: changePasswordInput,
      headers: {
        authorization: `Bearer ${tokenQuery}`,
      },
    });

    expect(response.statusCode).toBe(HttpStatusCode.NO_CONTENT);
    expect(response.body).toBe('');
    expect(changePasswordServiceSpy).toHaveBeenCalledWith(
      userId,
      ...Object.values(changePasswordInput),
    );

    checkAutheticationMiddlewareSpy.mockRestore();
    changePasswordServiceSpy.mockRestore();
  });

  it('Error updating password', async () => {
    const tokenQuery = faker.string.alphanumeric(10);
    const changePasswordInput = {
      password: faker.internet.password(),
      newPassword: faker.internet.password(),
      confirmNewPassword: faker.internet.password(),
    };

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
    const changePasswordServiceSpy = jest
      .spyOn(ChangePasswordService.prototype, 'execute')
      .mockRejectedValue(new BadRequestError(messageError));

    const response = await serverStub.inject({
      method: 'PATCH',
      url: '/my-account/change-password',
      payload: changePasswordInput,
      headers: {
        authorization: `Bearer ${tokenQuery}`,
      },
    });

    expect(response.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
    expect(response.headers['content-type']).toBe('application/json; charset=utf-8');
    expect(response.json()).toEqual({ message: messageError });
    expect(changePasswordServiceSpy).toHaveBeenCalledWith(
      userId,
      ...Object.values(changePasswordInput),
    );

    checkAutheticationMiddlewareSpy.mockRestore();
    changePasswordServiceSpy.mockRestore();
  });

  it('Error validation - example: password cannot be empty', async () => {
    const tokenQuery = faker.string.alphanumeric(10);
    const changePasswordInput = {
      password: '',
      newPassword: faker.internet.password(),
      confirmNewPassword: faker.internet.password(),
    };

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

    const response = await serverStub.inject({
      method: 'PATCH',
      url: '/my-account/change-password',
      payload: changePasswordInput,
      headers: {
        authorization: `Bearer ${tokenQuery}`,
      },
    });

    expect(response.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
    expect(response.json()).toEqual({
      details: ['String must contain at least 1 character(s)'],
      message: ERROR_VALIDATION,
    });

    checkAutheticationMiddlewareSpy.mockRestore();
  });
});
