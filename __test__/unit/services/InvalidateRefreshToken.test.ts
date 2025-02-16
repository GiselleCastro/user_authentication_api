import { UserRepository } from '../../../src/repositories/User';
import { InvalidateRefreshTokenService } from '../../../src/service/InvalidateRefreshToken';
import { RefreshTokenRepository } from '../../../src/repositories/RefreshToken';

import { faker } from '@faker-js/faker';
import { UUID } from '../../../src/@types';
import { BadRequestError } from '../../../src/config/BaseError';

jest.mock('../../../src/repositories/User');
jest.mock('../../../src/repositories/RefreshToken');

const makeSut = () => {
  const userRepositoryStub = new UserRepository() as jest.Mocked<UserRepository>;
  const refreshTokenRepositoryStub =
    new RefreshTokenRepository() as jest.Mocked<RefreshTokenRepository>;

  const sut = new InvalidateRefreshTokenService(
    userRepositoryStub,
    refreshTokenRepositoryStub,
  );

  return {
    sut,
    userRepositoryStub,
    refreshTokenRepositoryStub,
  };
};

describe('InvalidateRefreshTokenService', () => {
  it('Delete refresh token successfully', async () => {
    const { sut, userRepositoryStub, refreshTokenRepositoryStub } = makeSut();
    const userId = faker.string.uuid() as unknown as UUID;
    const loginMock = faker.internet.email();
    const passwordHashMock = faker.string.alphanumeric(10);

    userRepositoryStub.getUserById.mockImplementationOnce(async () => ({
      id: userId,
      email: loginMock,
      confirmed: true,
      password_hash: passwordHashMock,
    }));

    (
      refreshTokenRepositoryStub.deleteRefreshTokenByUserId as jest.Mock
    ).mockImplementationOnce(async () => {});

    expect(await sut.execute(userId)).toBeUndefined();
    expect(userRepositoryStub.getUserById).toHaveBeenCalledWith(userId);
    expect(refreshTokenRepositoryStub.deleteRefreshTokenByUserId).toHaveBeenCalledWith(
      userId,
    );
  });

  it('should return bad request if user not found', async () => {
    const { sut, userRepositoryStub, refreshTokenRepositoryStub } = makeSut();
    const userId = faker.string.uuid() as unknown as UUID;

    userRepositoryStub.getUserByLogin.mockImplementationOnce(async () => undefined);

    await expect(sut.execute(userId)).rejects.toBeInstanceOf(BadRequestError);
    expect(userRepositoryStub.getUserById).toHaveBeenCalledWith(userId);
    expect(refreshTokenRepositoryStub.deleteRefreshTokenByUserId).toHaveBeenCalledTimes(
      0,
    );
  });
});
