import { NextFunction, Request, Response } from "express";
import { STATUS_OK } from "../../../../config/config";
import { handleError } from "../../middleware/error";
import { Merchant } from "../../models/users";
const db = require("../../../../lib/initfirebase");

const updatePaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
  //TODO: create function to update payment status
};

export default { updatePaymentStatus };
