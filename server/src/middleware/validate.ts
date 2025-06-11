import { Request, Response, NextFunction } from 'express';
import JoiBase from 'joi';
import ErrorResponse from '../utils/errorHandler';

// Joi típusok kiterjesztése a TypeScript számára
type Schema = {
  body?: JoiBase.ObjectSchema;
  params?: JoiBase.ObjectSchema;
  query?: JoiBase.ObjectSchema;
};

// A validáló middleware
const validate = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const validationOptions = {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    };

    const { error, value } = JoiBase.object(schema).validate(
      {
        body: req.body,
        query: req.query,
        params: req.params,
      },
      validationOptions
    );

    if (error) {
      const errorMessage = error.details
        .map((detail: JoiBase.ValidationErrorItem) => detail.message)
        .join(', ');
      return next(new ErrorResponse(`Validation error: ${errorMessage}`, 400));
    }

    // Értékek frissítése a validált értékekkel
    req.body = value.body || {};
    req.params = value.params || {};
    req.query = value.query || {};

    next();
  };
};

export { validate, JoiBase as Joi };
