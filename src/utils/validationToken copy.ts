import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { UnauthorizedError } from "../config/BaseError";

export const validationToken = (token: string, secret: string) =>
  new Promise((resolve, reject) => {
    jwt.verify(token, secret, (error, decode) => {
      if (error) {
        reject(
          new UnauthorizedError((error as JsonWebTokenError)?.name, [
            (error as JsonWebTokenError)?.message,
          ]),
        );
      }
      resolve(decode);
    });
  });
