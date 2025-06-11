import { Joi } from '../middleware/validate';

// Regisztrációs séma
export const registerSchema = {
  body: Joi.object({
    username: Joi.string()
      .min(3)
      .max(20)
      .required()
      .messages({
        'string.empty': 'A felhasználónév megadása kötelező',
        'string.min': 'A felhasználónév legalább 3 karakter hosszú legyen',
        'string.max': 'A felhasználónév legfeljebb 20 karakter hosszú lehet',
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.empty': 'Az email cím megadása kötelező',
        'string.email': 'Érvényes email címet adjon meg',
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.empty': 'A jelszó megadása kötelező',
        'string.min': 'A jelszónak legalább 6 karakter hosszúnak kell lennie',
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'A jelszavak nem egyeznek',
      }),
  }),
};

// Bejelentkezési séma
export const loginSchema = {
  body: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.empty': 'Az email cím megadása kötelező',
        'string.email': 'Érvényes email címet adjon meg',
      }),
    password: Joi.string()
      .required()
      .messages({
        'string.empty': 'A jelszó megadása kötelező',
      }),
  }),
};
