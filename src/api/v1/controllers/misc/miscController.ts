import { NextFunction, Request, Response } from "express";
import { checkValidationError } from "../../../../utils/utils";
import { handleError } from "../../middleware/error";
const db = require("../../../../lib/initfirebase");

const addInterestedParty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await checkValidationError(req, res);
    const { email } = req.body;

    const notWaitlistCollection = db.collection("notWaitlist");
    const querySnapshot = await notWaitlistCollection.where("email", "==", email).get();

    if (!querySnapshot.empty) {
      return res.status(409).json({ message: "You've already been added!" });
    }

    const docRef = await notWaitlistCollection.add({ email });
    return res.status(201).json({
      message: "Added!",
      data: { id: docRef.id, email },
    });
  } catch (error: any) {
    console.error(error);
    return handleError(error, res);
  }
};

export default { addInterestedParty };
