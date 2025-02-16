import { UserRepository } from '../../../src/repositories/User';
import { DeleteUserService } from '../../../src/service/DeleteUser';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { UUID } from '../../../src/@types';
import { BadRequestError } from '../../../src/config/BaseError';

jest.mock('bcrypt');
jest.mock('../../../src/repositories/User');

const makeSut = () => {
  const userRepositoryStub = new UserRepository() as jest.Mocked<UserRepository>;

  const sut = new DeleteUserService(userRepositoryStub);

  return {
    sut,
    userRepositoryStub,
  };
};

describe('DeleteUserService', () => {
  it('Account deleted successfully', async () => {
    const { sut, userRepositoryStub } = makeSut();
    const userId = faker.string.uuid() as unknown as UUID;
    const emailMock = faker.internet.email();
    const passwordHashMock = faker.string.alphanumeric(10);
    const password = 'A@#z123457890';

    userRepositoryStub.getUserById.mockImplementationOnce(async () => ({
      id: userId,
      email: emailMock,
      confirmed: true,
      password_hash: passwordHashMock,
    }));

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    (userRepositoryStub.deleteUser as jest.Mock).mockImplementationOnce(async () => {});

    expect(await sut.execute(userId, password)).toBeUndefined();
    expect(userRepositoryStub.getUserById).toHaveBeenCalledWith(userId);
    expect(bcrypt.compare).toHaveBeenCalledWith(password, passwordHashMock);
    expect(userRepositoryStub.deleteUser).toHaveBeenCalledWith(userId);
  });

  it('should return bad request if user not found', async () => {
    const { sut, userRepositoryStub } = makeSut();
    const userId = faker.string.uuid() as unknown as UUID;
    const password = faker.string.alphanumeric(5);

    userRepositoryStub.getUserById.mockResolvedValue(undefined);

    await expect(sut.execute(userId, password)).rejects.toBeInstanceOf(BadRequestError);
    expect(userRepositoryStub.getUserById).toHaveBeenCalledWith(userId);
    expect(userRepositoryStub.deleteUser).toHaveBeenCalledTimes(0);
  });

  it('should return bad request if password not match', async () => {
    const { sut, userRepositoryStub } = makeSut();
    const userId = faker.string.uuid() as unknown as UUID;
    const emailMock = faker.internet.email();
    const passwordHashMock = faker.string.alphanumeric(10);
    const password = 'A@#z123457890';

    userRepositoryStub.getUserById.mockImplementationOnce(async () => ({
      id: userId,
      email: emailMock,
      confirmed: true,
      password_hash: passwordHashMock,
    }));

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(sut.execute(userId, password)).rejects.toBeInstanceOf(BadRequestError);
    expect(userRepositoryStub.getUserById).toHaveBeenCalledWith(userId);
    expect(bcrypt.compare).toHaveBeenCalledWith(password, passwordHashMock);
    expect(userRepositoryStub.deleteUser).toHaveBeenCalledTimes(0);
  });
});
