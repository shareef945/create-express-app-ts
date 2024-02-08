//PORTS
export const port = process.env.API_PORT || 3000;

//CONSTANTS
export const INVALID_PASSWORD_MASSAGE = "Invalid password, please try again";
export const INVALID_TOKEN_MESSAGE = "Invalid token";
export const UNPROTECTED_ROUTES = ["/v1/login", "/v1/auth/login", "/v1/auth/token/refresh", "/v1/interest"];

//ENVIRONMENT VARIABLES
export const API_PASSWORD = process.env.API_PASSWORD;
export const API_SECRET = process.env.SEM_API_SECRET;
export const API_KEY = process.env.API_KEY;
export const API_BASE_URL = process.env.API_BASE_URL

//FIREBASE - ENVIRONMENT VARIABLES
export const PROJECT_ID = process.env.PROJECT_ID;
export const PRIVATE_KEY_ID = process.env.PRIVATE_KEY_ID;
export const PRIVATE_KEY = process.env.PRIVATE_KEY;

// STATUS CODES
export const STATUS_OK = 200;
export const STATUS_CREATED = 201;
export const STATUS_BAD_REQUEST = 400;
export const STATUS_INTERNAL_SERVER_ERROR = 500;
export const STATUS_CONFLICT = 409;