import type { v4 as uuid } from 'uuid';
import { z } from 'zod';
import { TokenJSON, Authorization, Access } from './accessToken';
import * as Schema from '../schema/index';

export type CreateUser = z.infer<typeof Schema.CreateUser>;
export type Login = z.infer<typeof Schema.Login>;
export type LoginToRecoverPassword = z.infer<typeof Schema.LoginToRecoverPassword>;
export type NewPassword = z.infer<typeof Schema.NewPassword>;
export type ChangePassword = z.infer<typeof Schema.ChangePassword>;
export type Token = z.infer<typeof Schema.Token>;
export type Password = z.infer<typeof Schema.Password>;

export type UUID = typeof uuid;

export type RefreshToken = z.infer<typeof Schema.RefreshToken>;

export { TokenJSON, Authorization, Access };

export type RefresTokenJSON = {
  tokenId: UUID;
  id: UUID;
  tokenType: string;
  lastUsedAt: number;
};

export type InfoGenerateTokenType = {
  userId?: UUID;
  refreshToken?: string;
};
