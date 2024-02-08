import { body, ValidationChain } from "express-validator";

export const riderValidationMapping: { [key: string]: ValidationChain } = {
  dob: body("dob").isISO8601().withMessage("dob must be a valid date in the format YYYY-MM-DD and is required").notEmpty(),
  email: body("email").optional().bail().isEmail().withMessage("Email must be a valid email address"),
  name: body("name").isString().notEmpty().withMessage("name must be a string and is required"),
  phone_number: body("phone_number").isMobilePhone("en-GH").withMessage("phone_number must be a valid Ghanaian mobile number").notEmpty().withMessage("phone_number is required"),
};

export const validateRider = Object.values(riderValidationMapping);

export const filterPatchRiderValidation = (reqBody: object): ValidationChain[] => {
  const fieldsToUpdate = Object.keys(reqBody);
  const validations = fieldsToUpdate
    .filter((fieldName) => riderValidationMapping.hasOwnProperty(fieldName))
    .map((fieldName) => riderValidationMapping[fieldName])
    .filter(Boolean);
  return validations;
};

export const riderTransactionMapping: { [key: string]: ValidationChain } = {
  amount: body("amount").isNumeric().withMessage("amount must be a number and is required").notEmpty(),
  rider_id: body("rider_id").isString().withMessage("rider_id must be a string and is required").notEmpty(),
  transaction_type: body("transaction_type").isString().withMessage("transaction_type must be a string and is required").notEmpty(),
  description: body("description").isString().withMessage("description must be a string and is required").notEmpty(),
};

export const validateRiderTransaction = Object.values(riderTransactionMapping);

export const filterPatchRiderTransactionValidation = (reqBody: object): ValidationChain[] => {
  const fieldsToUpdate = Object.keys(reqBody);
  const validations = fieldsToUpdate.map((fieldName) => riderTransactionMapping[fieldName]).filter(Boolean);
  return validations;
};

export const riderTripMapping: { [key: string]: ValidationChain } = {
  start_location: body("start_location").isString().withMessage("start_location must be a string and is required").notEmpty(),
  final_location: body("final_location").isString().withMessage("final_location must be a string and is required").notEmpty(),
  rider_id: body("rider_id").isString().withMessage("rider_id must be a string and is required").notEmpty(),
  active_route_id: body("active_route_id").isString().withMessage("active_route_id must be a string and is required").notEmpty(),
  fare: body("fare").isNumeric().withMessage("fare must be a number and is required").notEmpty(),
  merchant_id: body("merchant_id").isString().withMessage("merchant_id must be a string and is required").notEmpty(),
};

export const validateRiderTrip = Object.values(riderTripMapping);

export const updateRiderTripMapping: { [key: string]: ValidationChain } = {
  status: body("status").notEmpty().withMessage("status must be a string and not empty."),
};

export const validateUpdateRiderTrip = Object.values(updateRiderTripMapping);

export const filterPatchRiderTripValidation = (reqBody: object): ValidationChain[] => {
  const fieldsToUpdate = Object.keys(reqBody);
  const validations = fieldsToUpdate.map((fieldName) => riderTripMapping[fieldName]).filter(Boolean);
  return validations;
};
