import { defaultMerchant } from "./../../models/merchants";
import { NextFunction, Request, Response } from "express";
import { STATUS_BAD_REQUEST, STATUS_CREATED, STATUS_INTERNAL_SERVER_ERROR, STATUS_OK } from "../../../../config/config";
import { checkValidationError } from "../../../../utils/utils";
import { handleError } from "../../middleware/error";
const db = require("../../../../lib/initfirebase");
import { Route } from "../../models/merchants";
import firebase from "firebase/compat/app";
import { filterPatchRouteValidation } from "../../middleware/validation/merchants";
import crypto from "crypto";

const addRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await checkValidationError(req, res);

    const documentId = crypto.randomUUID().replace(/-/g, "").slice(0, 20);
    const data = req.body;
    const created_at = new Date().getTime();
    await db
      .collection("merchant_routes")
      .doc(documentId)
      .set({
        ...data,
        id: documentId,
        is_active: false,
        last_modified: created_at,
        created_at,
      });
    return res.status(STATUS_CREATED).json({
      message: "Merchant route created.",
      data: {
        ...data,
        id: documentId,
        is_active: false,
        last_modified: created_at,
        created_at,
      }
    });
  } catch (error: any) {
    return handleError(error, res);
  }
};

const setActiveRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await checkValidationError(req, res);

    const { route_id, merchant_id } = req.body;
    const routeRef = db.collection("merchant_routes").doc(route_id);
    const merchantRef = db.collection("users").doc(merchant_id);

    const [routeSnapshot, merchantSnapshot] = await Promise.all([routeRef.get(), merchantRef.get()]);

    if (!routeSnapshot.exists || !merchantSnapshot.exists) {
      return res.status(STATUS_BAD_REQUEST).json({ message: "Merchant or Route not found" });
    }

    let routeData = routeSnapshot.data();
    const created_at = new Date().getTime();

    const { is_active, ...everythingExceptIs_active } = routeData;

    await db.runTransaction(async (t: firebase.firestore.Transaction) => {
      t.update(merchantRef, {
        active_route: {
          ...everythingExceptIs_active,
          last_modified: created_at,
          created_at,
        },
      });
      t.update(routeRef, {
        is_active: true,
        last_modified: created_at,
      });
    });

    routeData.is_active = true;

    return res.status(STATUS_OK).json({
      message: `Merchant ${merchant_id} updated with active route successfully`,
      data: { active_route: routeData },
    });
  } catch (error: any) {
    return handleError(error, res);
  }
};

const getRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.body;
    const routeRef = db.collection("merchant_routes").doc(id).get();

    if (!routeRef.exists) {
      return res.status(204).send();
    }

    return res.status(STATUS_OK).json({
      message: "Data retrieved successfully",
      data: routeRef.data(),
    });
  } catch (error: any) {
    return handleError(error, res);
  }
};

const getRoutes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: Route[] = [];
    const querySnapshot = await db.collection("merchant_routes").get();
    querySnapshot.forEach((doc: any) => {
      data.push(doc.data());
    });
    return res.status(STATUS_OK).json({
      message: "Data retrieved successfully",
      data,
    });
  } catch (error: any) {
    return handleError(error, res);
  }
};

const updateRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validations = filterPatchRouteValidation(req.body);
    await Promise.all(validations.map((validation) => validation.run(req)));
    await checkValidationError(req, res);

    const updates: Partial<Route> = req.body;
    const { id } = req.params;

    const docRef = db.collection("merchant_routes").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(STATUS_BAD_REQUEST).json({
        message: `Route with id ${id} does not exist`,
      });
    }
    const routePreUpdate: Route = doc.data();
    const last_modified = new Date().getTime();

    // update route
    await docRef.update({ ...updates, last_modified });

    // if its an active route, find the merchant and update
    if (routePreUpdate?.is_active) {
      await db
        .collection("merchants")
        .doc(routePreUpdate.merchant_id)
        .update({
          active_route: {
            ...routePreUpdate,
            ...updates,
            last_modified,
          },
        });
    }
    return res.status(STATUS_OK).json({
      message: `Route with ${id} updated successfully`,
      data: { id, ...updates },
    });
  } catch (error: any) {
    return handleError(error, res);
  }
};

const deleteRoute = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    await db.runTransaction(async (transaction: firebase.firestore.Transaction) => {
      // Step 1: find route and copy object
      const routeRef = db.collection("merchant_routes").doc(id);
      const doc = await transaction.get(routeRef);
      if (!doc.exists) {
        throw new Error(`Route with id ${id} does not exist`);
      }
      const toArchive: Route = doc.data() as Route;

      // Step 2: Remove as an active route if active
      if (toArchive?.is_active) {
        const merchantRef = db.collection("merchants").doc(toArchive.merchant_id);
        const merchant = await transaction.get(merchantRef);
        if (!merchant.exists) {
          throw new Error(`Please investigate: Failed to unset active route when merchant requested route deletion. Route id: ${id}`);
        }
        transaction.update(merchantRef, {
          active_route: {
            ...defaultMerchant,
            last_modified: new Date().getTime(),
          },
        });
      }

      // Step 3: Paste copy in archive
      const archiveRef = db.collection("routes_deleted").doc(id);
      transaction.set(archiveRef, { deleted: new Date().getTime(), ...toArchive });

      // Step 4: Delete route
      transaction.delete(routeRef);
    });

    return res.status(STATUS_OK).json({
      message: `Merchant route ${id} deleted successfully`,
    });
  } catch (error: any) {
    return handleError(error, res);
  }
};

export default { addRoute, setActiveRoute, getRoute, getRoutes, updateRoute, deleteRoute };
