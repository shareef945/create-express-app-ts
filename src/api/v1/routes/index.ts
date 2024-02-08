import { registerInterestValidationMapping, validateInterest } from "./../middleware/validation/misc";
//NOTE: THE ORDER OF ROUTES MATTER
import express from "express";
import authController from "../controllers/auth/auth";
import callbackController from "../controllers/callback/callback";
import merchantRoutesController from "../controllers/merchants/merchant-routes";
import merchantsController from "../controllers/merchants/merchants";
import riderTripsController from "../controllers/riders/rider-trips";
import ridersController from "../controllers/riders/riders";
import transactionsController from "../controllers/transactions/transactions";
import miscController from "../controllers/misc/miscController";
import usersController from "../controllers/users/users";
import { authLoginValidationMapping, refreshTokenValidationMapping, validateAuthLogin, validateNewPinPost, changePinMapping, validateRefreshTokenPost } from "../middleware/validation/auth";
import { activeRouteValidationMapping, merchantRouteValidationMapping, merchantValidationMapping, validateAddMate, validateMerchant, validateMerchantRoute } from "../middleware/validation/merchants";
import { riderTripMapping, riderValidationMapping, validateRider } from "../middleware/validation/riders";
import { transactionValidationMapping, validateTransaction } from "../middleware/validation/transactions";
import { validateFields } from "../middleware/validation/validation";
import { AuthLoginRequestBody, NewPIN, RefreshTokenBody, RegisterInterestBody } from "../models/auth";
import { ActiveRouteRequest, Route } from "../models/merchants";
import { RiderTrip } from "../models/riders";
import { Transaction } from "../models/transactions";
import { Merchant, User } from "../models/users";

const router = express.Router();

router.post("/interest", validateFields<RegisterInterestBody>(registerInterestValidationMapping), validateInterest, miscController.addInterestedParty);

router.post("/login", authController.generateAToken);
router.post("/auth/login", validateFields<AuthLoginRequestBody>(authLoginValidationMapping), validateAuthLogin, authController.authenticateUser);
router.post("/auth/pin", validateFields<NewPIN>(changePinMapping), validateNewPinPost, authController.changePin);
router.post("/auth/token/refresh", validateFields<RefreshTokenBody>(refreshTokenValidationMapping), validateRefreshTokenPost, authController.refreshAccessToken);

router.get("/users", usersController.getUsers);
router.get("/users/riders", ridersController.getRiders);
router.get("/users/merchants", merchantsController.getMerchants);
router.get("/users/merchants/:id", merchantsController.getMerchant);

router.post("/users/riders", validateFields<User>(riderValidationMapping), validateRider, ridersController.addRider);
router.post("/users/merchants", validateFields<Merchant>(merchantValidationMapping), validateMerchant, merchantsController.addMerchant);
router.post("/users/merchants/mates", validateAddMate, merchantsController.addMate);
router.delete("/users/merchants/:id/mates", merchantsController.removeMate);

router.patch("/users/riders/:id", validateFields<User>(riderValidationMapping), ridersController.updateRider);
router.patch("/users/merchants/:id", validateFields<Merchant>(merchantValidationMapping), merchantsController.updateMerchant);

router.get("/users/:id", usersController.getUser);
router.delete("/users/:id", usersController.deleteUser);

router.get("/trips", riderTripsController.getTrips);
router.get("/trips/rider", riderTripsController.getRiderTrips);
router.get("/trips/merchant", riderTripsController.getMerchantTrips);
router.post("/trips", validateFields<RiderTrip>(riderTripMapping), riderTripsController.addTrip);

router.get("/trips/:id", riderTripsController.getTrip);

router.get("/merchant-routes", merchantRoutesController.getRoutes);
router.post("/merchant-routes", validateFields<Route>(merchantRouteValidationMapping), validateMerchantRoute, merchantRoutesController.addRoute);
router.post("/merchant-routes/active", validateFields<ActiveRouteRequest>(activeRouteValidationMapping), merchantRoutesController.setActiveRoute);

router.get("/merchant-routes/:id", merchantRoutesController.getRoute);
router.patch("/merchant-routes/:id", validateFields<Route>(merchantRouteValidationMapping), merchantRoutesController.updateRoute);
router.delete("/merchant-routes/:id", merchantRoutesController.deleteRoute);

router.get("/transactions", transactionsController.getTransactions);
router.post("/transactions", validateFields<Transaction>(transactionValidationMapping), validateTransaction, transactionsController.newTransaction);
router.get("/transactions/merchant/:id", transactionsController.getMerchantTransactions);
router.get("/transactions/rider/:id", transactionsController.getRiderTransactions);

router.get("/transactions/:id", transactionsController.getTransaction);
router.patch("/transactions/:id", transactionsController.updateTransaction);

router.post("/callback", callbackController.updatePaymentStatus);

export = router;
