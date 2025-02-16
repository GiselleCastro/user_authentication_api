import { UserRepository } from '../../../src/repositories/User';
import { ChangePasswordService } from '../../../src/service/ChangePassword';
import bcrypt from 'bcrypt';
import { getPasswordHash } from '../../../src/utils/passwordHash';
import { faker } from '@faker-js/faker';
import { UUID } from '../../../src/@types';
import { BadRequestError } from '../../../src/config/BaseError';

jest.mock('bcrypt');
jest.mock('../../../src/utils/passwordHash');
jest.mock('../../../src/repositories/User');

const makeSut = () => {
  const userRepositoryStub = new UserRepository() as jest.Mocked<UserRepository>;

  const sut = new ChangePasswordService(userRepositoryStub);

  return {
    sut,
    userRepositoryStub,
  };
};

describe('ChangePasswordService', () => {
  it('Change password successfully', async () => {
    const { sut, userRepositoryStub } = makeSut();
    const userId = faker.string.uuid() as unknown as UUID;
    const emailMock = faker.internet.email();
    const passwordHashMock = faker.string.alphanumeric(10);
    const password = 'A@#z123457890';
    const newPassword = 'A@#z123457890@@';
    const confirmNewPassword = 'A@#z123457890@@';
    const newPasswordHashMock = faker.string.alphanumeric(10);

    userRepositoryStub.getUserById.mockImplementationOnce(async () => ({
      id: userId,
      email: emailMock,
      confirmed: true,
      password_hash: passwordHashMock,
    }));

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    (getPasswordHash as jest.Mock).mockResolvedValue(newPasswordHashMock);

    (userRepositoryStub.updatePassword as jest.Mock).mockImplementationOnce(
      async () => {},
    );

    expect(
      await sut.execute(userId, password, newPassword, confirmNewPassword),
    ).toBeUndefined();
    expect(userRepositoryStub.getUserById).toHaveBeenCalledWith(userId);
    expect(getPasswordHash).toHaveBeenCalledWith(newPassword, confirmNewPassword);
    expect(userRepositoryStub.updatePassword).toHaveBeenCalledWith(
      emailMock,
      newPasswordHashMock,
    );
  });

  it('should return bad request if user not found', async () => {
    const { sut, userRepositoryStub } = makeSut();
    const userId = faker.string.uuid() as unknown as UUID;
    const password = faker.string.alphanumeric(5);
    const newPassword = faker.string.alphanumeric(5);
    const confirmNewPassword = faker.string.alphanumeric(5);

    userRepositoryStub.getUserById.mockResolvedValue(undefined);

    await expect(
      sut.execute(userId, password, newPassword, confirmNewPassword),
    ).rejects.toBeInstanceOf(BadRequestError);
    expect(userRepositoryStub.getUserById).toHaveBeenCalledWith(userId);
    expect(getPasswordHash).toHaveBeenCalledTimes(0);
    expect(userRepositoryStub.updatePassword).toHaveBeenCalledTimes(0);
  });

  it('should return bad request if password not match', async () => {
    const { sut, userRepositoryStub } = makeSut();
    const userId = faker.string.uuid() as unknown as UUID;
    const emailMock = faker.internet.email();
    const passwordHashMock = faker.string.alphanumeric(10);
    const password = 'A@#z123457890';
    const newPassword = 'A@#z123457890@@';
    const confirmNewPassword = 'A@#z123457890@@';

    userRepositoryStub.getUserById.mockImplementationOnce(async () => ({
      id: userId,
      email: emailMock,
      confirmed: true,
      password_hash: passwordHashMock,
    }));

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      sut.execute(userId, password, newPassword, confirmNewPassword),
    ).rejects.toBeInstanceOf(BadRequestError);
    expect(userRepositoryStub.getUserById).toHaveBeenCalledWith(userId);
    expect(bcrypt.compare).toHaveBeenCalledWith(password, passwordHashMock);
    expect(getPasswordHash).toHaveBeenCalledTimes(0);
    expect(userRepositoryStub.updatePassword).toHaveBeenCalledTimes(0);
  });
});
