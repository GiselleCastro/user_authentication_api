export const createUser = {
  tags: ["User"],
  body: {
    type: "object",
    required: ["username", "email", "password", "confirmPassword"],
    additionalProperties: false,
    properties: {
      username: {
        type: "string",
      },
      email: {
        type: "string",
      },
      password: {
        type: "string",
      },
      confirmPassword: {
        type: "string",
      },
    },
  },
  summary: "User register",
  response: {
    "201": {
      description: "User registered successfully",
      type: "null",
    },
    "400": {
      description:
        "User already registered, error validation or email not sent to confirm email",
      type: "object",
      properties: {
        message: {
          type: "string",
        },
        details: {
          type: "array",
          optional: true,
        },
      },
    },
    "401": {
      description:
        "User already registered, but email not confirmed. The email is resent",
      type: "object",
      properties: {
        message: {
          type: "string",
        },
        details: {
          type: "array",
          optional: true,
        },
      },
    },
  },
};

export const login = {
  tags: ["User"],
  body: {
    type: "object",
    required: ["login", "password"],
    additionalProperties: false,
    properties: {
      login: {
        type: "string",
      },
      password: {
        type: "string",
      },
    },
  },
  summary: "User login",
  response: {
    "200": {
      description: "Token generated successfully",
      type: "object",
      properties: {
        token: {
          type: "string",
        },
      },
    },
    "400": {
      description:
        "Non-existent user, error validation or email not sent to confirm email",
      type: "object",
      properties: {
        message: {
          type: "string",
        },
        details: {
          type: "array",
          optional: true,
        },
      },
    },
    "401": {
      description: "Email not confirmed. The email is resent",
      type: "object",
      properties: {
        message: {
          type: "string",
        },
        details: {
          type: "array",
          optional: true,
        },
      },
    },
  },
};

export const forgotPassword = {
  tags: ["User"],
  body: {
    type: "object",
    required: ["login"],
    additionalProperties: false,
    properties: {
      login: {
        type: "string",
      },
    },
  },
  summary: "Send email with link to reset password",
  response: {
    "204": {
      description: "Email sending successfully",
      type: "null",
    },
    "400": {
      description:
        "Non-existent user, error validation or email not sent to reset password",
      type: "object",
      properties: {
        message: {
          type: "string",
        },
        details: {
          type: "array",
          optional: true,
        },
      },
    },
  },
};

export const resetPassword = {
  tags: ["User"],
  querystring: {
    type: "object",
    required: ["token"],
    additionalProperties: false,
    properties: {
      token: {
        type: "string",
      },
    },
  },
  body: {
    type: "object",
    required: ["password", "confirmPassword"],
    additionalProperties: false,
    properties: {
      password: {
        type: "string",
      },
      confirmPassword: {
        type: "string",
      },
    },
  },
  summary: "User regains access through password reset",
  response: {
    "204": {
      description: "Reset password successfully",
      type: "null",
    },
    "400": {
      description: "Passwords do not match or error validation",
      type: "object",
      properties: {
        message: {
          type: "string",
        },
        details: {
          type: "array",
          optional: true,
        },
      },
    },
    "401": {
      description: "Invalid token",
      type: "object",
      properties: {
        message: {
          type: "string",
        },
        details: {
          type: "array",
          optional: true,
        },
      },
    },
    "422": {
      description: "Token already used",
      type: "object",
      properties: {
        message: {
          type: "string",
        },
        details: {
          type: "array",
          optional: true,
        },
      },
    },
  },
};

export const confirmEmail = {
  tags: ["User"],
  querystring: {
    type: "object",
    required: ["token"],
    additionalProperties: false,
    properties: {
      token: {
        type: "string",
      },
    },
  },
  summary: "Confirm registered email",
  response: {
    "204": {
      description: "Confirmed email registered successfully",
      type: "null",
    },
    "400": {
      description: "Non-existent user or error validation",
      type: "object",
      properties: {
        message: {
          type: "string",
        },
        details: {
          type: "array",
          optional: true,
        },
      },
    },
    "401": {
      description: "Invalid token",
      type: "object",
      properties: {
        message: {
          type: "string",
        },
        details: {
          type: "array",
          optional: true,
        },
      },
    },
  },
};

export const changePassword = {
  tags: ["User"],
  body: {
    type: "object",
    required: ["password", "newPassword", "confirmNewPassword"],
    additionalProperties: false,
    properties: {
      password: {
        type: "string",
      },
      newPassword: {
        type: "string",
      },
      confirmNewPassword: {
        type: "string",
      },
    },
  },
  summary: "User regains access through password reset",
  response: {
    "204": {
      description: "Password changed successfully",
      type: "null",
      examples: [],
    },
    "400": {
      description:
        "Password incorrect, new passwords do not match or error validation",
      type: "object",
      properties: {
        message: {
          type: "string",
        },
        details: {
          type: "array",
          optional: true,
        },
      },
    },
    "401": {
      description: "Invalid token",
      type: "object",
      properties: {
        message: {
          type: "string",
        },
        details: {
          type: "array",
          optional: true,
        },
      },
    },
  },
};
