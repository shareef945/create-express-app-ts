import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { STATUS_BAD_REQUEST } from "../config/config";

export const formatToMsisdn = (phoneNumber: string) => {
  let msisdn = phoneNumber.replace(/\D/g, "");

  if (msisdn.startsWith("0")) {
    msisdn = msisdn.slice(1);
  }

  if (!msisdn.startsWith("233")) {
    msisdn = "233" + msisdn;
  }

  return msisdn;
};

export const checkValidationError = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors
      .array()
      .filter((err) => err.msg !== "Invalid value")
      .map((err) => ({
        field: (err as any).path,
        message: err.msg,
      }));
    throw new ValidationError(formattedErrors);
  }
};

export class ValidationError extends Error {
  formattedErrors: any;
  constructor(formattedErrors: any) {
    super("Validation error");
    this.name = "ValidationError";
    this.message = "Validation Error";
    this.formattedErrors = formattedErrors;
  }
}
