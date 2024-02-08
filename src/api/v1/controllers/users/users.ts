import { NextFunction, Request, Response } from "express";
import { STATUS_BAD_REQUEST, STATUS_OK } from "../../../../config/config";
import { handleError } from "../../middleware/error";
import { User } from "../../models/users";
const db = require("../../../../lib/initfirebase");
const bcrypt = require("bcryptjs");
import firebase from "firebase/compat/app";

const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users: User[] = [];
    const querySnapshot = await db.collection("users").get();
    querySnapshot.forEach((doc: any) => {
      users.push(doc.data());
    });
    return res.status(STATUS_OK).json({
      message: "Data retrieved successfully",
      data: users,
    });
  } catch (error: any) {
    return handleError(error, res);
  }
};

const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let id: string = req.params.id;
    const doc = await db.collection("users").doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        message: `User with id ${id} does not exist`,
      });
    }
    const userData = doc.data();
    const { pin, ...everythingExceptPIN } = userData;

    return res.status(STATUS_OK).json({
      message: "Data retrieved successfully",
      data: everythingExceptPIN,
    });
  } catch (error: any) {
    return handleError(error, res);
  }
};

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    await db.runTransaction(async (transaction: firebase.firestore.Transaction) => {
      // Step 1: find user and copy object
      const docRef = db.collection("users").doc(id);
      const doc = await transaction.get(docRef);
      if (!doc.exists) {
        throw new Error(`User with id ${id} does not exist`);
      }
      const toArchive: User = doc.data() as User;

      // Step 2: Copy to archive
      const archiveRef = db.collection("users_deleted").doc(id);
      transaction.set(archiveRef, { deleted: new Date().getTime(), ...toArchive });

      // Step 4: Delete route
      transaction.delete(docRef);
    });

    return res.status(STATUS_OK).json({
      message: `User ${id} deleted successfully`,
    });
  } catch (error: any) {
    return handleError(error, res);
  }
};

export default { getUsers, getUser, deleteUser };
