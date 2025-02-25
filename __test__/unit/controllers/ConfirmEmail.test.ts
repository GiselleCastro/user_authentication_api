import type { FastifyInstance } from 'fastify/types/instance';
import { ConfirmEmailService } from '../../../src/service/ConfirmEmail';
import { server } from '../../../src/server';
import { faker } from '@faker-js/faker';
import { BadRequestError } from '../../../src/config/BaseError';
import { ERROR_VALIDATION } from '../../../src/utils/messages';
import HttpStatusCode from 'http-status-codes';

jest.mock('../../../src/service/ConfirmEmail');

describe('GET /confirm-email', () => {
  let serverStub: FastifyInstance;

  beforeAll(async () => {
    serverStub = server;
  });

  afterAll(async () => {
    await serverStub.close();
  });

  it('Email confirmed successfully', async () => {
    const tokenQuery = { token: faker.string.alphanumeric(30) };

    const confirmEmailServiceSpy = jest
      .spyOn(ConfirmEmailService.prototype, 'execute')
      .mockResolvedValue();

    const response = await serverStub.inject({
      method: 'GET',
      url: '/confirm-email',
      query: tokenQuery,
    });

    expect(response.statusCode).toBe(HttpStatusCode.NO_CONTENT);
    expect(response.body).toEqual('');
    expect(confirmEmailServiceSpy).toHaveBeenCalledWith(...Object.values(tokenQuery));

    confirmEmailServiceSpy.mockRestore();
  });

  it('Error confirming email', async () => {
    const tokenQuery = { token: faker.string.alphanumeric(30) };

    const messageError = 'error';
    const confirmEmailServiceSpy = jest
      .spyOn(ConfirmEmailService.prototype, 'execute')
      .mockRejectedValue(new BadRequestError(messageError));

    const response = await serverStub.inject({
      method: 'GET',
      url: '/confirm-email',
      query: tokenQuery,
    });

    expect(response.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
    expect(response.headers['content-type']).toBe('application/json; charset=utf-8');
    expect(response.json()).toEqual({ message: messageError });
    expect(confirmEmailServiceSpy).toHaveBeenCalledWith(...Object.values(tokenQuery));

    confirmEmailServiceSpy.mockRestore();
  });

  it('Error validation - example: token cannot be empty', async () => {
    const tokenQuery = { token: '' };

    const response = await serverStub.inject({
      method: 'GET',
      url: '/confirm-email',
      query: tokenQuery,
    });

    expect(response.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
    expect(response.json()).toEqual({
      details: ['String must contain at least 1 character(s)'],
      message: ERROR_VALIDATION,
    });
  });
});
