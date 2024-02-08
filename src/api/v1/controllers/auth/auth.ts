import { NextFunction, Request, Response } from "express";
import { API_PASSWORD, STATUS_OK, WEB_CLIENT_ID, USSD_CLIENT_ID, INVALID_PASSWORD_MASSAGE, STATUS_INTERNAL_SERVER_ERROR, STATUS_BAD_REQUEST, API_SECRET } from "../../../../config/config";
import { handleError } from "../../middleware/error";
import { generateRefreshToken, generateToken, verifyRefreshToken } from "../../../../utils/generateToken";
const db = require("../../../../lib/initfirebase");
const bcrypt = require("bcryptjs");
import jwt from "jsonwebtoken";
import { tokenPayload } from "../../models/auth";
import { User } from "../../models/users";
import { formatToMsisdn } from "../../../../utils/utils";

/** GENERATE TOKEN */
const generateAToken = async (req: Request, res: Response, next: NextFunction) => {
  const correctPassword = API_PASSWORD;
  if (req.body.Password !== correctPassword) {
    return res.status(401).json({ message: INVALID_PASSWORD_MASSAGE });
  }
  const token = generateToken(req.body.Password, "admin", "admin");
  res.json({ token });
};

const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let username: string = req.body.username;
    let password: string = req.body.password;
    let clientId: string = req.body.client_id;

    const client = clientId === WEB_CLIENT_ID ? "web" : clientId === USSD_CLIENT_ID ? "ussd" : null;

    if (!client) {
      return res.status(401).json({
        error: "Invalid client",
        message: `Client with id ${clientId} is not recognized`,
      });
    }

    const usersCollection = db.collection("users");
    const doc = await usersCollection.where("phone_number", "==", `${username}`).get();

    if (doc.empty) {
      return res.status(STATUS_INTERNAL_SERVER_ERROR).json({
        error: "User not found",
        message: `User ${username} does not exist`,
      });
    }

    const thing = doc.docs[0];
    const user = thing.data();
    const { pin, ...everythingExceptPIN } = user;

    let passwordsMatch = true;

    if (pin) {
      passwordsMatch = await bcrypt.compare(String(password), pin);
    }

    if (passwordsMatch) {
      thing.ref.update({
        lastloggedInAt: new Date().getTime(),
      });
      return res.status(STATUS_OK).json({
        message: "User authenticated.",
        accessToken: generateToken(API_PASSWORD!, username, client),
        refreshToken: generateRefreshToken(username, client),
        user: everythingExceptPIN,
      });
    } else {
      return res.status(STATUS_BAD_REQUEST).json({
        error: "User authentication failed",
        message: `Wrong pin provided`,
      });
    }
  } catch (error: any) {
    return handleError(error, res);
  }
};

const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accessToken, refreshToken } = req.body;
    const decoded = jwt.verify(accessToken, API_PASSWORD!, { ignoreExpiration: true }) as tokenPayload;

    const isValidRefreshToken = verifyRefreshToken(refreshToken, decoded.userId);
    if (!isValidRefreshToken) {
      return res.status(401).json({
        error: "Invalid refresh token",
        message: "The refresh token is not valid or expired",
      });
    }

    const newAccessToken = generateToken(API_PASSWORD!, decoded.userId, decoded?.client ? decoded.client : "admin");
    return res.status(STATUS_OK).json({
      message: "Access token refreshed",
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error: any) {
    return handleError(error, res);
  }
};

const changePin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newPin = req.body.newPin;
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPin = await bcrypt.hash(newPin, salt);
    const token = req.headers["authorization"]?.slice(7);
    const decoded = jwt.decode(token!) as tokenPayload | null;
    let phone = decoded?.userId;

    if (!phone) {
      return res.status(STATUS_BAD_REQUEST).json({
        message: `Something went wrong`,
      });
    }

    if (phone === 'admin') {
      phone = req.body.user_id;
    }

    const docRef = db.collection("users").doc(formatToMsisdn(phone!));
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(STATUS_BAD_REQUEST).json({
        message: `Something went wrong with finding ${phone}.`,
      });
    }

    const userData = doc.data() as User;

    await docRef.update({
      pin: hashedPin,
      last_modified: new Date().getTime(),
    });
    return res.status(STATUS_OK).json({
      message: `Pin for ${phone} changed successfully`,
    });
  } catch (error: any) {
    return handleError(error, res);
  }
};

export default { generateAToken, authenticateUser, refreshAccessToken, changePin };
