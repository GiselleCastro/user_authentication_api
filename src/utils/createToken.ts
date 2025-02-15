import jwt from 'jsonwebtoken';
import { BadRequestError } from '../config/BaseError';

export const createToken = (
  payload: object,
  secret: string,
  expiresIn: number,
): Promise<string> =>
  new Promise((resolve, reject) => {
    jwt.sign(payload, secret, { expiresIn }, (error, token) => {
      if (typeof token === 'string') resolve(token);
      if (error) reject(new BadRequestError(error?.name, [error?.message]));
    });
  });
