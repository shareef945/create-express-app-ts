import { Request, Response, NextFunction } from "express";
const db = require("../../../../lib/initfirebase");
import { validationResult } from "express-validator";
import { handleError } from "../../middleware/error";
import { STATUS_BAD_REQUEST, STATUS_CREATED, STATUS_OK } from "../../../../config/config";
import { RiderTrip } from "../../models/riders";

const getTrips = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const riderTrips: RiderTrip[] = [];
    const querySnapshot = await db.collection("rider_trips").get();
    querySnapshot.forEach((doc: any) => {
      riderTrips.push(doc.data());
    });
    return res.status(STATUS_OK).json({
      message: "Data retrieved successfully",
      data: riderTrips,
    });
  } catch (error: any) {
    return handleError(error, res);
  }
};

const getTrip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let id: string = req.params.id;
    const doc = await db.collection("rider_trips").doc(id).get();
    if (!doc.exists) {
      return res.status(204).send();
    }
    const riderTripData = doc.data();
    return res.status(STATUS_OK).json({
      message: "Data retrieved successfully",
      data: riderTripData,
    });
  } catch (error: any) {
    return handleError(error, res);
  }
};

const addTrip = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors
      .array()
      .filter((err) => err.msg !== "Invalid value")
      .map((err) => ({
        field: (err as any).path,
        message: err.msg,
      }));
    return res.status(STATUS_BAD_REQUEST).json({
      message: "Validation failed",
      errors: formattedErrors,
    });
  }

  try {
    const documentId = crypto.randomUUID().replace(/-/g, "").slice(0, 20);
    const data = req.body;
    const docRef = await db
      .collection("rider_trips")
      .doc(documentId)
      .set({
        id: documentId,
        ...data,
        created_at: new Date().getTime(),
      });

    console.log("Trip document created with document id: ", documentId);
    return res.status(STATUS_CREATED).json({
      message: "Trip created!",
      documentId,
    });
  } catch (error: any) {
    return handleError(error, res);
  }
};

const getMerchantTrips = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.query.hasOwnProperty("merchantId")) {
    return res.status(400).json({ message: "Missing merchantId query parameter" });
  }
  try {
    let merchantId: string = req.query.merchantId as string;
    const doc = await db
      .collection("rider_trips")
      .where("merchant_id", "==", merchantId)
      .get()
      .then((querySnapshot: any) => {
        if (!querySnapshot.empty) {
          const data: RiderTrip[] = [];
          querySnapshot.forEach((doc: any) => {
            data.push(doc.data());
          });
          return res.status(STATUS_OK).json({
            message: "Data retrieved successfully",
            data,
          });
        } else {
          return res.status(204).send();
        }
      });
  } catch (error: any) {
    return handleError(error, res);
  }
};

const getRiderTrips = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.query.hasOwnProperty("riderId")) {
    return res.status(400).json({ message: "Missing riderId query parameter" });
  }
  try {
    let riderId: string = req.query.riderId as string;
    const doc = await db
      .collection("rider_trips")
      .where("rider_id", "==", riderId)
      .get()
      .then((querySnapshot: any) => {
        if (!querySnapshot.empty) {
          const data: RiderTrip[] = [];
          querySnapshot.forEach((doc: any) => {
            data.push(doc.data());
          });
          return res.status(STATUS_OK).json({
            message: "Data retrieved successfully",
            data,
          });
        } else {
          return res.status(204).send();
        }
      });
  } catch (error: any) {
    return handleError(error, res);
  }
};

export default { getTrips, getTrip, addTrip, getMerchantTrips, getRiderTrips };
