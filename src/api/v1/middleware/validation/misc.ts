import { body, ValidationChain } from "express-validator";

export const registerInterestValidationMapping: { [key: string]: ValidationChain } = {
  email: body("email").isEmail().notEmpty().withMessage("Email must be a valid email address"),
};

export const validateInterest = Object.values(registerInterestValidationMapping);
