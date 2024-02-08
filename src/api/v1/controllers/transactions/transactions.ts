import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { DUPLICATE_TRANSACTION_BUFFER, STATUS_BAD_REQUEST, STATUS_CREATED, STATUS_OK } from "../../../../config/config";
import { handleError } from "../../middleware/error";
import { checkValidationError } from "../../../../utils/utils";
import { Transaction } from "../../models/transactions";
const db = require("../../../../lib/initfirebase");

// A transaction should handle the process of collecting a payment from a rider.
// It raises an instance of a payment handling function and a transaction object that can be updated with the result of the payment
// TODO: add an option for just logging (without creating a charge) if hubtel addToCart works client side

const newTransaction = async (req: Request, res: Response, next: NextFunction) => {
  const transaction: Transaction = req.body;
  const transactionDate = new Date();
  const minutesBefore = new Date(transactionDate.getTime() - DUPLICATE_TRANSACTION_BUFFER * 60 * 1000);
  const minutesAfter = new Date(transactionDate.getTime() + DUPLICATE_TRANSACTION_BUFFER * 60 * 1000);

  try {
    await checkValidationError(req, res);
    const transactionId = uuidv4();
    const potentialDuplicate = await db.collection("transactions").where("sender_id", "==", transaction.sender_id).where("amount", "==", transaction.amount).where("merchant_id", "==", transaction.merchant_id).where("transaction_created", ">=", minutesBefore).where("transaction_created", "<=", minutesAfter).get();

    if (!potentialDuplicate.empty) {
      return res.status(STATUS_BAD_REQUEST).json({
        message: "Duplicate transaction detected",
        data: potentialDuplicate.data(),
      });
    }

    const dataToStore = {
      ...transaction,
      id: transactionId,
      transaction_created: transactionDate.getTime(),
      transaction_status: "PENDING",
    };

    // TODO: handle all payment initiation here (by calling separate payment intent function that deals with payment methods)
    // if payment initiated, set data

    await db.collection("transactions").doc(transactionId).set(dataToStore);

    // callback handles updating the transaction object

    return res.status(STATUS_CREATED).json({
      message: `Transaction ${transactionId} created successfully`,
      data: dataToStore,
    });
  } catch (error: any) {
    return handleError(error, res);
  }
};

const getTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let id: string = req.params.id;
    const doc = await db.collection("transactions").doc(id).get();
    if (!doc.exists) {
      return res.status(204).send();
    }
    const data = doc.data();
    return res.status(STATUS_OK).json({
      message: "Data retrieved successfully",
      data,
    });
  } catch (error: any) {
    return handleError(error, res);
  }
};

const getRiderTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let riderId: string = req.params.id;

    const transactionsSnapshot = await db.collection("transactions").where("sender_id", "==", riderId).get();

    if (transactionsSnapshot.empty) {
      return res.status(204).send();
    }

    const transactions = transactionsSnapshot.docs.map((doc: any) => doc.data());
    return res.status(200).json({
      message: "Data retrieved successfully",
      data: transactions,
    });
  } catch (error: any) {
    return handleError(error, res);
  }
};

const getMerchantTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let merchantId: string = req.params.id;

    const transactionsSnapshot = await db.collection("transactions").where("merchant_id", "==", merchantId).get();

    if (transactionsSnapshot.empty) {
      return res.status(204).send();
    }

    const transactions = transactionsSnapshot.docs.map((doc: any) => doc.data());
    return res.status(200).json({
      message: "Data retrieved successfully",
      data: transactions,
    });
  } catch (error: any) {
    return handleError(error, res);
  }
};

const getTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let data: Transaction[] = [];
    const querySnapshot = await db.collection("transactions").get();
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

// TODO: update functionality to integrate with hubtel
// TODO: how to secure the endpoint?
const updateTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await checkValidationError(req, res);
    const updates: Partial<Transaction> = req.body;
    const { id } = req.params;

    const docRef = db.collection("transactions").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(STATUS_BAD_REQUEST).json({
        message: `Transaction ${id} does not exist`,
      });
    }

    await docRef.update(updates);
    return res.status(STATUS_OK).json({
      message: `Transaction ${id} updated successfully`,
      data: { id, ...updates },
    });
  } catch (error: any) {
    return handleError(error, res);
  }
};

export default {
  newTransaction,
  updateTransaction,
  getTransaction,
  getRiderTransactions,
  getMerchantTransactions,
  getTransactions,
};
