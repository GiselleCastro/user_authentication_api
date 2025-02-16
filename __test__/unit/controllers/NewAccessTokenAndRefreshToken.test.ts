import type { FastifyInstance } from 'fastify/types/instance';
import { GenerateRefreshTokenAndAccessTokenService } from '../../../src/service/GenerateRefreshTokenAndAccessToken';
import { server } from '../../../src/server';
import { faker } from '@faker-js/faker';
import { BadRequestError } from '../../../src/config/BaseError';
import { ERROR_VALIDATION } from '../../../src/utils/messages';
import HttpStatusCode from 'http-status-codes';

jest.mock('../../../src/service/GenerateRefreshTokenAndAccessToken');

describe('POST /refresh-token', () => {
  let serverStub: FastifyInstance;

  beforeAll(async () => {
    serverStub = server;
  });

  afterAll(async () => {
    await serverStub.close();
  });

  it('Refresh token generated successfully', async () => {
    const accessTokenMock = faker.string.alphanumeric(30);
    const newRefreshTokenMock = faker.string.alphanumeric(30);
    const oldRefreshTokenMock = faker.string.alphanumeric(30);

    const generateTokenServiceSpy = jest
      .spyOn(GenerateRefreshTokenAndAccessTokenService.prototype, 'execute')
      .mockResolvedValue({
        accessToken: accessTokenMock,
        refreshToken: newRefreshTokenMock,
      });

    const response = await serverStub.inject({
      method: 'POST',
      url: '/refresh-token',
      payload: { refreshToken: oldRefreshTokenMock },
    });

    expect(response.statusCode).toBe(HttpStatusCode.OK);
    expect(response.headers['content-type']).toBe('application/json; charset=utf-8');
    expect(response.json()).toEqual({
      accessToken: accessTokenMock,
      refreshToken: newRefreshTokenMock,
    });
    expect(generateTokenServiceSpy).toHaveBeenCalledWith({
      refreshToken: oldRefreshTokenMock,
    });

    generateTokenServiceSpy.mockRestore();
  });

  it('Error generating refresh token', async () => {
    const oldRefreshTokenMock = faker.string.alphanumeric(30);

    const messageError = 'error';
    const generateTokenServiceSpy = jest
      .spyOn(GenerateRefreshTokenAndAccessTokenService.prototype, 'execute')
      .mockRejectedValue(new BadRequestError(messageError));

    const response = await serverStub.inject({
      method: 'POST',
      url: '/refresh-token',
      payload: { refreshToken: oldRefreshTokenMock },
    });

    expect(response.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
    expect(response.headers['content-type']).toBe('application/json; charset=utf-8');
    expect(response.json()).toEqual({ message: messageError });
    expect(generateTokenServiceSpy).toHaveBeenCalledWith({
      refreshToken: oldRefreshTokenMock,
    });

    generateTokenServiceSpy.mockRestore();
  });

  it('Error validation - example: no refresh token', async () => {
    const oldRefreshTokenMock = '';

    const response = await serverStub.inject({
      method: 'POST',
      url: '/refresh-token',
      payload: { refreshToken: oldRefreshTokenMock },
    });

    expect(response.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
    expect(response.json()).toEqual({
      details: ['String must contain at least 1 character(s)'],
      message: ERROR_VALIDATION,
    });
  });
});
