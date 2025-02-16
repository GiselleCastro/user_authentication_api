import type { FastifySchema } from 'fastify/types/schema';

export const createUser: FastifySchema = {
  tags: ['Public User register'],
  body: {
    type: 'object',
    properties: {
      username: {
        type: 'string',
      },
      email: {
        type: 'string',
      },
      password: {
        type: 'string',
      },
      confirmPassword: {
        type: 'string',
      },
    },
    required: ['username', 'email', 'password', 'confirmPassword'],
    additionalProperties: false,
  },
  summary: 'User register',
  response: {
    '201': {
      description: 'User registered successfully',
      type: 'null',
    },
    '400': {
      description:
        'User already registered, error validation or email not sent to confirm email',
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
        details: {
          type: 'array',
          optional: true,
        },
      },
    },
    '401': {
      description:
        'User already registered, but email not confirmed. The email is resent',
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
        details: {
          type: 'array',
          optional: true,
        },
      },
    },
  },
};

export const login: FastifySchema = {
  tags: ['Public User login'],
  body: {
    type: 'object',
    required: ['login', 'password'],
    additionalProperties: false,
    properties: {
      login: {
        type: 'string',
      },
      password: {
        type: 'string',
      },
    },
  },
  summary: 'User login',
  response: {
    '200': {
      description: 'Token generated successfully',
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
        },
        refreshToken: {
          type: 'string',
        },
      },
    },
    '400': {
      description:
        'Non-existent user, error validation or email not sent to confirm email',
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
        details: {
          type: 'array',
          optional: true,
        },
      },
    },
    '401': {
      description: 'Email not confirmed. The email is resent',
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
        details: {
          type: 'array',
          optional: true,
        },
      },
    },
  },
};

export const forgotPassword: FastifySchema = {
  tags: ['Public Password Recovery'],
  body: {
    type: 'object',
    required: ['login'],
    additionalProperties: false,
    properties: {
      login: {
        type: 'string',
      },
    },
  },
  summary: 'Send email with link to reset password',
  response: {
    '204': {
      description: 'Email sending successfully',
      type: 'null',
    },
    '400': {
      description:
        'Non-existent user, error validation or email not sent to reset password',
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
        details: {
          type: 'array',
          optional: true,
        },
      },
    },
  },
};

export const resetPassword: FastifySchema = {
  tags: ['Public Password Recovery'],
  querystring: {
    type: 'object',
    required: ['token'],
    additionalProperties: false,
    properties: {
      token: {
        type: 'string',
        description: 'token sent by email',
      },
    },
  },
  body: {
    type: 'object',
    required: ['password', 'confirmPassword'],
    additionalProperties: false,
    properties: {
      password: {
        type: 'string',
      },
      confirmPassword: {
        type: 'string',
      },
    },
  },
  summary: 'User regains access through password reset',
  response: {
    '204': {
      description: 'Reset password successfully',
      type: 'null',
    },
    '400': {
      description: 'Passwords do not match or error validation',
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
        details: {
          type: 'array',
          optional: true,
        },
      },
    },
    '401': {
      description: 'Invalid token',
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
        details: {
          type: 'array',
          optional: true,
        },
      },
    },
    '422': {
      description: 'Token already used',
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
        details: {
          type: 'array',
          optional: true,
        },
      },
    },
  },
};

export const confirmEmail: FastifySchema = {
  tags: ['Public User register'],
  querystring: {
    type: 'object',
    required: ['token'],
    additionalProperties: false,
    properties: {
      token: {
        type: 'string',
      },
    },
  },
  summary: 'Confirm registered email',
  response: {
    '204': {
      description: 'Confirmed email registered successfully',
      type: 'null',
    },
    '400': {
      description: 'Non-existent user or error validation',
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
        details: {
          type: 'array',
          optional: true,
        },
      },
    },
    '401': {
      description: 'Invalid token',
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
        details: {
          type: 'array',
          optional: true,
        },
      },
    },
  },
};

export const changePassword: FastifySchema = {
  tags: ['Private Change Password'],
  security: [{ authorization: [] }],
  body: {
    type: 'object',
    required: ['password', 'newPassword', 'confirmNewPassword'],
    additionalProperties: false,
    properties: {
      password: {
        type: 'string',
      },
      newPassword: {
        type: 'string',
      },
      confirmNewPassword: {
        type: 'string',
      },
    },
  },
  summary: 'User regains access through password reset',
  response: {
    '204': {
      description: 'Password changed successfully',
      type: 'null',
      examples: [],
    },
    '400': {
      description: 'Password incorrect, new passwords do not match or error validation',
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
        details: {
          type: 'array',
          optional: true,
        },
      },
    },
    '401': {
      description: 'Invalid token',
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
        details: {
          type: 'array',
          optional: true,
        },
      },
    },
  },
};

export const newRefreshToken: FastifySchema = {
  tags: ['Public Access token and refresh token'],
  body: {
    type: 'object',
    required: ['refreshToken'],
    additionalProperties: false,
    properties: {
      refreshToken: {
        type: 'string',
      },
    },
  },
  summary:
    'Generate access token and refresh token. The refresh token is generate only if access token is expired',
  response: {
    '200': {
      description: 'Access token and refresh token generated successfully',
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
        },
        refreshToken: {
          type: 'string',
          optional: true,
        },
      },
    },
    '400': {
      description: 'Non-existent user or error validation',
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
        details: {
          type: 'array',
          optional: true,
        },
      },
    },
    '401': {
      description: 'Expired token',
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
        details: {
          type: 'array',
          optional: true,
        },
      },
    },
  },
};

export const logout: FastifySchema = {
  tags: ['Private User Logout'],
  security: [{ authorization: [] }],
  summary: 'Delete refresh token',
  response: {
    '204': {
      description: 'Logout successfully',
      type: 'object',
    },
    '400': {
      description: 'Non-existent user or error validation',
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
        details: {
          type: 'array',
          optional: true,
        },
      },
    },
  },
};

export const deleteAccount: FastifySchema = {
  tags: ['Private Delete Account'],
  security: [{ authorization: [] }],
  body: {
    type: 'object',
    required: ['password'],
    additionalProperties: false,
    properties: {
      password: {
        type: 'string',
      },
    },
  },
  summary: 'User delete your account',
  response: {
    '204': {
      description: 'Account deleted successfully',
      type: 'null',
      examples: [],
    },
    '400': {
      description: 'Password incorrect',
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
        details: {
          type: 'array',
          optional: true,
        },
      },
    },
    '401': {
      description: 'Invalid token',
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
        details: {
          type: 'array',
          optional: true,
        },
      },
    },
  },
};
