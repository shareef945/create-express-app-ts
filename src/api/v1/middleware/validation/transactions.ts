import { body, ValidationChain } from "express-validator";

export const transactionValidationMapping: { [key: string]: ValidationChain } = {
  transaction_type: body("transaction_type").notEmpty().isString().withMessage("transaction_status must be a string and is required"),
  amount: body("amount").isNumeric().notEmpty().withMessage("amount must be a number and is required"),
  currency: body("currency").notEmpty().isString().withMessage("currency must be a string and is required"),
  sender_id: body("sender_id").notEmpty().isString().withMessage("sender_id must be a string and is required"),
  merchant_id: body("merchant_id").notEmpty().isString().withMessage("merchant_id must be a string and is required"),
  payment_method: body("payment_method").notEmpty().isString().withMessage("payment_method must be a string and is required"),
};

export const validateTransaction = Object.values(transactionValidationMapping);

export const updateTransactionValidationMapping: { [key: string]: ValidationChain } = {
  transaction_status: body("transaction_status").notEmpty().isIn(["PENDING", "SUCCESSFUL", "FAILED"]).withMessage("transaction_status must be a string and can only be PENDING, SUCCESSFUL or FAILED"),
  transaction_settled: body("transaction_settled").notEmpty().isString().withMessage("transaction_settled must be a string and is required"),
};

export const validateUpdateTransaction = Object.values(updateTransactionValidationMapping);
