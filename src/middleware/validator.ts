/* eslint-disable @typescript-eslint/no-explicit-any */
import { RequestHandler } from "express";
import * as yup from "yup";

// Middleware for validating the request body

export const validate = (schema: any): RequestHandler => {
  return async (req, res, next) => {
    if (!req.body) return res.status(400).json({ error: "Empty body is not excepted!" });
    const schemaToValidate = yup.object({
      body: schema,
    });

    try {
      await schemaToValidate.validate(
        {
          body: req.body,
        },
        {
          abortEarly: true,
        }
      );

      next();
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        res.status(400).json({
            error: error.message,
            });
      }
    }
  };
};
