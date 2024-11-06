import PasswordValidator from "password-validator";

export const validationPassword = (password: string) => {
  const schema = new PasswordValidator();
  const checkPassword = schema
    .is()
    .min(6)
    .is()
    .max(22)
    .has()
    .uppercase()
    .has()
    .lowercase()
    .has()
    .digits()
    .has()
    .symbols()
    .has()
    .not()
    .spaces();

  const isStrongPassword = checkPassword.validate(password);

  if (typeof isStrongPassword === "boolean" && isStrongPassword)
    return isStrongPassword;

  const detailsValidations = checkPassword.validate(password, {
    details: true,
  }) as Array<{ message: string }>;
  return detailsValidations.map((i) => i.message);
};
