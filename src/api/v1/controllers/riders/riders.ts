import { NextFunction, Request, Response } from "express";
import { STATUS_BAD_REQUEST, STATUS_CONFLICT, STATUS_CREATED, STATUS_OK } from "../../../../config/config";
import { checkValidationError, formatToMsisdn } from "../../../../utils/utils";
import { handleError } from "../../middleware/error";
import { filterPatchRiderValidation } from "../../middleware/validation/riders";
import { User } from "../../models/users";
const db = require("../../../../lib/initfirebase");

const getRiders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ridersRef = db.collection("users").where("roles", "array-contains", "RIDER");
    const snapshot = await ridersRef.get();

    if (snapshot.empty) {
      return res.status(STATUS_OK).json({
        message: "No riders found",
      });
    }

    const riders: User[] = [];
    snapshot.forEach((doc: any) => {
      riders.push({ id: doc.id, ...doc.data() });
    });

    return res.status(STATUS_OK).json(riders);
  } catch (error: any) {
    return handleError(error, res);
  }
};

const addRider = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await checkValidationError(req, res);
    const rider: User = req.body;
    rider.roles = ["RIDER"];
    const { id, phone_number, ...riderWithoutIdAndPhone } = rider;
    const formattedId = formatToMsisdn(phone_number);
    const registration_date = new Date().toISOString().slice(0, 10);
    const docRef = db.collection("users").doc(formattedId);
    const doc = await docRef.get();

    if (doc.exists) {
      const userData = doc.data() as User;
      if (!userData.roles.includes("RIDER")) {
        userData.roles.push("RIDER");
        await docRef.update({
          roles: userData.roles,
          last_modified: new Date().getTime(),
        });
        return res.status(STATUS_CONFLICT).json({
          message: "User account already exists. User role updated.",
          data: userData,
        });
      } else {
        return res.status(STATUS_CONFLICT).json({
          message: "User account already exists and already has the RIDER role.",
          data: [],
        });
      }
    } else {
      await db
        .collection("users")
        .doc(formattedId)
        .set({ id: formattedId, phone_number, ...riderWithoutIdAndPhone, registration_date });
      return res.status(STATUS_CREATED).json({
        message: `Rider ${rider.name} created successfully`,
        data: { id: formattedId, phone_number, ...riderWithoutIdAndPhone, registration_date },
      });
    }
  } catch (error: any) {
    return handleError(error, res);
  }
};

const updateRider = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validations = filterPatchRiderValidation(req.body);
    await Promise.all(validations.map((validation) => validation.run(req)));
    await checkValidationError(req, res);

    const riderUpdates: Partial<User> = req.body;
    const { id } = req.params;

    const docRef = db.collection("users").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(STATUS_BAD_REQUEST).json({
        message: `Rider with id ${id} does not exist`,
      });
    }

    const userData = doc.data() as User;

    if (userData.roles.includes("RIDER")) {
      await docRef.update({
        ...riderUpdates,
        last_modified: new Date().getTime(),
      });
      return res.status(STATUS_OK).json({
        message: `Rider ${id} updated successfully`,
        data: { id, ...riderUpdates },
      });
    } else {
      return res.status(STATUS_BAD_REQUEST).json({
        message: `${id} is not a rider.`,
      });
    }
  } catch (error: any) {
    return handleError(error, res);
  }
};

export default { getRiders, addRider, updateRider };
