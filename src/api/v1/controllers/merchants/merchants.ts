import { NextFunction, Request, Response } from "express";
import { STATUS_BAD_REQUEST, STATUS_CREATED, STATUS_OK } from "../../../../config/config";
import { checkValidationError, formatToMsisdn } from "../../../../utils/utils";
import { handleError } from "../../middleware/error";
import { filterPatchMerchantValidation } from "../../middleware/validation/merchants";
import { Merchant, User } from "../../models/users";
const db = require("../../../../lib/initfirebase");
import { defaultMerchant } from "../../models/merchants";
import { FieldValue } from "firebase-admin/firestore";

const addMerchant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await checkValidationError(req, res);

    const merchant: Merchant = req.body;
    merchant.roles = ["MERCHANT"];
    const formattedId = formatToMsisdn(merchant.phone_number);
    const created_at = new Date().getTime();

    const userRef = db.collection("users").doc(formattedId);
    const user = await userRef.get();

    if (user.exists) {
      const userData = user.data() as User;

      if (!userData.roles.includes("MERCHANT")) {
        userData.roles.push("MERCHANT");
        await userRef.update({
          ...defaultMerchant,
          ...merchant,
          roles: userData.roles,
          last_modified: new Date().getTime(),
        });
        return res.status(STATUS_CREATED).json({
          message: "User account already exists. User role updated.",
          data: userData,
        });
      } else {
        return res.status(STATUS_CREATED).json({
          message: "User account already exists and already has the MERCHANT role.",
          data: [],
        });
      }
    } else {
      await db
        .collection("users")
        .doc(formattedId)
        .set({
          ...defaultMerchant,
          ...merchant,
          id: formattedId,
          created_at,
          last_modified: created_at,
        });
      return res.status(STATUS_CREATED).json({
        message: `Merchant account for ${merchant.name} created successfully`,
        data: { ...merchant, id: formattedId, created_at },
      });
    }
  } catch (error: any) {
    return handleError(error, res);
  }
};

const getMerchant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id: string = req.params.id;
    const usersCollection = db.collection("users");

    const doc = await usersCollection.doc(id).get();
    let responseData: any = {};

    if (!doc.exists) {
      const mateDoc = await usersCollection.where("mate_id", "==", `${id}`).get();
      if (!mateDoc.empty) {
        responseData = mateDoc.docs[0].data();
        responseData.role = "mate";
      } else {
        return res.status(404).json({
          message: `Merchant account with driver or mate id ${id} does not exist`,
        });
      }
    } else {
      const userData = doc.data();
      let { pin, ...everythingExceptPIN } = userData;
      responseData = {
        ...responseData,
        ...everythingExceptPIN,
        role: "driver",
      };
      if (!pin) {
        responseData = {
          ...responseData,
          requireNewPin: true,
        };
      }
      if (responseData?.active_route?.start_location === "" || !responseData?.active_route?.start_location) {
        responseData = {
          ...responseData,
          requireActiveRoute: true,
        };
      }
    }

    return res.status(200).json({
      message: "Data retrieved successfully",
      data: responseData,
    });
  } catch (error: any) {
    return handleError(error, res);
  }
};

const getMerchants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantsRef = db.collection("users").where("roles", "array-contains", "MERCHANT");
    const snapshot = await merchantsRef.get();

    if (snapshot.empty) {
      return res.status(STATUS_OK).json({
        message: "No merchants found",
      });
    }

    const merchants: Merchant[] = [];
    snapshot.forEach((doc: any) => {
      merchants.push({ id: doc.id, ...doc.data() });
    });

    return res.status(STATUS_OK).json(merchants);
  } catch (error: any) {
    return handleError(error, res);
  }
};

const updateMerchant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validations = filterPatchMerchantValidation(req.body);
    await Promise.all(validations.map((validation) => validation.run(req)));
    await checkValidationError(req, res);

    const updates: Partial<Merchant> = req.body;
    const { id } = req.params;

    const docRef = db.collection("users").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(STATUS_BAD_REQUEST).json({
        message: `Merchant with id ${id} does not exist`,
      });
    }

    const userData = doc.data() as User;

    if (userData.roles.includes("MERCHANT")) {
      await docRef.update({
        ...updates,
        last_modified: new Date().getTime(),
      });
      return res.status(STATUS_OK).json({
        message: `Merchant ${id} updated successfully`,
        data: { id, ...updates },
      });
    } else {
      return res.status(STATUS_BAD_REQUEST).json({
        message: `${id} is not a merchant.`,
      });
    }
  } catch (error: any) {
    return handleError(error, res);
  }
};

const addMate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await checkValidationError(req, res);

    const { mate_phone_number, mate_name } = req.body;
    const { merchant_id } = req.body;
    const mate_id = formatToMsisdn(mate_phone_number);

    const docRef = db.collection("users").doc(merchant_id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(STATUS_BAD_REQUEST).json({
        message: `Merchant with id ${merchant_id} does not exist`,
      });
    }

    const userData = doc.data() as User;

    if (userData.roles.includes("MERCHANT")) {
      await docRef.update({
        mate_id,
        mate_name,
        mate_phone_number,
        merchant_type: "driver_and_mate",
        last_modified: new Date().getTime(),
      });
      return res.status(STATUS_OK).json({
        message: `Mate added to ${merchant_id} successfully. Note that if a mate already existed on the account, this action has overwritten it.`,
        data: { merchant_id, mate_id, mate_name, mate_phone_number },
      });
    } else {
      return res.status(STATUS_BAD_REQUEST).json({
        message: `${merchant_id} is not a merchant.`,
      });
    }
  } catch (error: any) {
    return handleError(error, res);
  }
};

const removeMate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const docRef = db.collection("users").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(STATUS_BAD_REQUEST).json({
        message: `Merchant with id ${id} does not exist`,
      });
    }

    const userData = doc.data() as User;

    if (userData.roles.includes("MERCHANT")) {
      await docRef.update({
        mate_id: FieldValue.delete(),
        mate_name: FieldValue.delete(),
        mate_phone_number: FieldValue.delete(),
        merchant_type: "driver",
        last_modified: new Date().getTime(),
      });
      return res.status(STATUS_OK).json({
        message: `Mate removed from ${id} recprd successfully.`,
      });
    } else {
      return res.status(STATUS_BAD_REQUEST).json({
        message: `${id} is not a merchant.`,
      });
    }
  } catch (error: any) {
    return handleError(error, res);
  }
};

export default { addMerchant, getMerchants, updateMerchant, getMerchant, addMate, removeMate };
