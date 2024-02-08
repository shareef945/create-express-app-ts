//remember to update phone validation for other countries

import { body, ValidationChain } from "express-validator";

export const merchantValidationMapping: { [key: string]: ValidationChain } = {
  // pin: body("pin").isInt().notEmpty()
  // .withMessage("A pin must be Int and is required"),
  name: body("name").isString().notEmpty().withMessage("name must be a string and is required"),
  city: body("city").isString().notEmpty().withMessage("city must be a string and is required"),
  driver_name: body("driver_name").isString().notEmpty().withMessage("driver name must be a string and is required"),
  phone_number: body("phone_number").isMobilePhone("en-GH").withMessage("phone_number must be a valid Ghanaian mobile number").notEmpty().withMessage("phone_number is required"),
  dob: body("dob").isISO8601().withMessage("dob must be a valid date in the format YYYY-MM-DD and is required").notEmpty(),
  merchant_type: body("merchant_type").isIn(["driver", "driver_and-mate"]).withMessage("merchant_type must be either driver or driver_and_mate").notEmpty().withMessage("merchant_type is required"),
  drivers_license_number: body("drivers_license_number").isString().notEmpty().withMessage("drivers_license_number must be a string and is required"),
  license_plate_number: body("license_plate_number").isString().notEmpty().withMessage("license_plate_number must be a string and is required"),
};

export const validateMerchant = Object.values(merchantValidationMapping);

export const filterPatchMerchantValidation = (reqBody: object): ValidationChain[] => {
  const fieldsToUpdate = Object.keys(reqBody);
  const validations = fieldsToUpdate.map((fieldName) => merchantValidationMapping[fieldName]).filter(Boolean);
  return validations;
};

export const merchantRouteValidationMapping: { [key: string]: ValidationChain } = {
  merchant_id: body("merchant_id").notEmpty().isString().withMessage("merchant_id must be a string and is required"),
  start_location: body("start_location").notEmpty().isString().withMessage("start_location must be a string and is required"),
  end_location: body("end_location").notEmpty().isString().withMessage("end_location must be a string and is required"),
  fare: body("fare").isNumeric().notEmpty().withMessage("fare must be a number and is required"),
};

export const validateMerchantRoute = Object.values(merchantRouteValidationMapping);

export const filterPatchRouteValidation = (reqBody: object): ValidationChain[] => {
  const fieldsToUpdate = Object.keys(reqBody);
  const validations = fieldsToUpdate.map((fieldName) => merchantRouteValidationMapping[fieldName]).filter(Boolean);
  return validations;
};

export const activeRouteValidationMapping: { [key: string]: ValidationChain } = {
  route_id: body("route_id").notEmpty().isString().withMessage("route_id must be a string and is required"),
  merchant_id: body("merchant_id").notEmpty().isString().withMessage("merchant_id must be a string and is required"),
};

export const validateSetActiveRoute = Object.values(activeRouteValidationMapping);

export const addMateMapping: { [key: string]: ValidationChain } = {
  mate_phone_number: body("mate_phone_number").notEmpty().isString().withMessage("mate_phone_number must be a string and is required"),
  mate_name: body("mate_name").notEmpty().isString().withMessage("mate_name must be a string and is required"),
  merchant_id: body("merchant_id").notEmpty().isString().withMessage("merchant_id must be a string and is required"),
};

export const validateAddMate = Object.values(addMateMapping);
