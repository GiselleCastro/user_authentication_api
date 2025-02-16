import { CheckAutheticationMiddleware } from './CheckAuthetication';
import { ValidateSchemaMiddleware } from './ValidateSchema';
import { ParameterType } from '../enum/index';
import { CheckAuthorizationMiddleware } from './CheckAuthorization';
import * as Schema from '../schema';

export const checkAuthetication = new CheckAutheticationMiddleware().handle;

export const checkAuthorization = new CheckAuthorizationMiddleware().handle;

const validateSchemaMiddleware = new ValidateSchemaMiddleware().handle;

export const validateRefreshToken = validateSchemaMiddleware(
  Schema.RefreshToken,
  ParameterType.BODY,
);

export const validateCreateUserInput = validateSchemaMiddleware(
  Schema.CreateUser,
  ParameterType.BODY,
);

export const validateLoginInput = validateSchemaMiddleware(
  Schema.Login,
  ParameterType.BODY,
);

export const validateLoginToRecoverPasswordInput = validateSchemaMiddleware(
  Schema.LoginToRecoverPassword,
  ParameterType.BODY,
);

export const validateNewPasswordInput = validateSchemaMiddleware(
  Schema.NewPassword,
  ParameterType.BODY,
);

export const validateChangePasswordInput = validateSchemaMiddleware(
  Schema.ChangePassword,
  ParameterType.BODY,
);

export const validateTokenInput = validateSchemaMiddleware(
  Schema.Token,
  ParameterType.QUERY,
);
