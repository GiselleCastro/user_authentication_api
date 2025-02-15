import { z } from 'zod';
import { validate } from 'uuid';
import { UUID } from '../@types';

export const CreateUser = z.object({
  username: z
    .string()
    .trim()
    .regex(/^[A-z-0-9]$/),
  email: z.string().trim().min(1).email(),
  password: z.string().trim().min(1),
  confirmPassword: z.string().trim().min(1),
});

export const Login = z.object({
  login: z.string().trim().min(1),
  password: z.string().trim().min(1),
});

export const LoginToRecoverPassword = z.object({
  login: z.string().trim().min(1),
});

export const NewPassword = z.object({
  password: z.string().trim().min(1),
  confirmPassword: z.string().trim().min(1),
});

export const ChangePassword = z.object({
  password: z.string().trim().min(1),
  newPassword: z.string().trim().min(1),
  confirmNewPassword: z.string().trim().min(1),
});

export const Token = z.object({
  token: z.string().trim().min(1),
});

export const UserId = z.object({
  userId: z.custom<UUID>((i) => (typeof i === 'string' ? validate(i) : false)),
});

export const AccessTokenAndRefreshToken = z.object({
  accessToken: z.string().trim().min(1),
  refreshToken: z.string().trim().min(1),
});
