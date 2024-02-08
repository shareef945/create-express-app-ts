import { serviceAccount } from "./serviceAccountkey";

// Initialise firebase Admin module
const admin = require("firebase-admin");

require("firebase/firestore");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
// initialise the database
const db = admin.firestore();

module.exports = db;
