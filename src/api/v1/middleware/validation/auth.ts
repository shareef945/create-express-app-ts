import { body, ValidationChain } from "express-validator";

export const authLoginValidationMapping: { [key: string]: ValidationChain } = {
  password: body("password").isString().notEmpty().withMessage("password must be a string and is required"),
  username: body("username").isString().notEmpty().withMessage("name must be a string and is required"),
  client_id: body("client_id").isString().notEmpty().withMessage("client_id must be a string and is required"),
};

export const validateAuthLogin = Object.values(authLoginValidationMapping);

export const refreshTokenValidationMapping: { [key: string]: ValidationChain } = {
  accessToken: body("accessToken").isString().notEmpty().withMessage("accessToken must be a string and is required"),
  refreshToken: body("refreshToken").isString().notEmpty().withMessage("refreshToken must be a string and is required"),
};

export const validateRefreshTokenPost = Object.values(refreshTokenValidationMapping);

export const changePinMapping: { [key: string]: ValidationChain } = {
  newPin: body("newPin").isString().notEmpty().withMessage("newPin must be a string and is required"),
  client_id: body("client_id").isString().notEmpty().withMessage("client_id must be a string and is required"),
  user_id: body("user_id").isString().notEmpty().withMessage("user_id must be a string and is required"),
};

export const validateNewPinPost = Object.values(changePinMapping);
