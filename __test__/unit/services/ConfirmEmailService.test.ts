import { UserRepository } from '../../../src/repositories/User';
import { ConfirmEmailService } from '../../../src/service/ConfirmEmail';
import { faker } from '@faker-js/faker';
import { BadRequestError, UnauthorizedError } from '../../../src/config/BaseError';
import { UUID } from '../../../src/@types';
import { validationToken } from '../../../src/utils/validationToken';

jest.mock('../../../src/repositories/User');
jest.mock('../../../src/utils/validationToken');

const makeSut = () => {
  const userRepositoryStub = new UserRepository() as jest.Mocked<UserRepository>;
  const sut = new ConfirmEmailService(userRepositoryStub);

  return {
    sut,
    userRepositoryStub,
  };
};

describe('ConfirmEmailService', () => {
  it('Email confirmed successfully', async () => {
    const { sut, userRepositoryStub } = makeSut();
    const passwordMock = 'A@#z123457890';
    const idMock = faker.string.uuid() as unknown as UUID;
    const usernameMock = faker.person.firstName();
    const tokenMock = faker.string.alphanumeric(10);
    const loginMock = faker.internet.email();

    (validationToken as jest.Mock).mockResolvedValueOnce({ email: loginMock });

    userRepositoryStub.getUserByLogin.mockResolvedValueOnce({
      id: idMock,
      username: usernameMock,
      email: loginMock,
      confirmed: false,
      password_hash: passwordMock,
    });

    userRepositoryStub.confirmEmail.mockResolvedValueOnce(1);

    expect(await sut.execute(tokenMock)).toBeUndefined();
    expect(userRepositoryStub.getUserByLogin).toHaveBeenCalledWith(loginMock);
    expect(userRepositoryStub.confirmEmail).toHaveBeenCalledWith(loginMock);
  });

  it('should return bad request if email has already been confirmed', async () => {
    const { sut, userRepositoryStub } = makeSut();
    const passwordMock = 'A@#z123457890';
    const idMock = faker.string.uuid() as unknown as UUID;
    const usernameMock = faker.person.firstName();
    const tokenMock = faker.string.alphanumeric(10);
    const loginMock = faker.internet.email();

    (validationToken as jest.Mock).mockResolvedValueOnce({ email: loginMock });

    userRepositoryStub.getUserByLogin.mockResolvedValueOnce({
      id: idMock,
      username: usernameMock,
      email: loginMock,
      confirmed: true,
      password_hash: passwordMock,
    });

    userRepositoryStub.confirmEmail.mockResolvedValueOnce(1);

    await expect(sut.execute(tokenMock)).rejects.toBeInstanceOf(BadRequestError);
    expect(userRepositoryStub.getUserByLogin).toHaveBeenCalledWith(loginMock);
  });

  it('should return bad request if not found to get for email by token', async () => {
    const { sut, userRepositoryStub } = makeSut();
    const tokenMock = faker.string.alphanumeric(10);
    const loginMock = faker.internet.email();

    (validationToken as jest.Mock).mockResolvedValueOnce({ email: loginMock });

    userRepositoryStub.getUserByLogin.mockImplementationOnce(async () => undefined);

    await expect(sut.execute(tokenMock)).rejects.toBeInstanceOf(BadRequestError);
    expect(userRepositoryStub.getUserByLogin).toHaveBeenCalledWith(loginMock);
  });

  it('should return unauthorized error for invalid token', async () => {
    async () => {
      const { sut } = makeSut();
      const tokenMock = faker.string.alphanumeric(10);

      (validationToken as jest.Mock).mockRejectedValueOnce(
        new UnauthorizedError('error'),
      );

      await expect(sut.execute(tokenMock)).rejects.toThrow(UnauthorizedError);
    };
  });

  it('should return bad request if there is no mail property in the token', async () => {
    const { sut, userRepositoryStub } = makeSut();
    const tokenMock = faker.string.alphanumeric(10);

    (validationToken as jest.Mock).mockResolvedValueOnce({ other: '' });

    await expect(sut.execute(tokenMock)).rejects.toBeInstanceOf(UnauthorizedError);
    expect(userRepositoryStub.getUserByLogin).not.toHaveBeenCalled();
  });
});
