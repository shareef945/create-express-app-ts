import { PRIVATE_KEY, PRIVATE_KEY_ID, PROJECT_ID } from "../config/config";

const privateKey = PRIVATE_KEY!.replace(/\\n/g, "\n");

export const serviceAccount = {
  type: "service_account",
  project_id: "mtn-transport-api",
  private_key_id: PRIVATE_KEY_ID,
  private_key: privateKey,
  client_email: "firebase-adminsdk-hkn01@mtn-transport-api.iam.gserviceaccount.com",
  client_id: "105467728311865359461",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-hkn01%40mtn-transport-api.iam.gserviceaccount.com",
};
