import { Route } from "./merchants";

export interface User {
  id: string;
  name: string;
  phone_number: string;
  email: string;
  registration_date: number;
  dob: Date;
  roles: ("MERCHANT" | "RIDER")[];
  pre_approval?: {
    authorised: string | number;
    expiry: string | number;
  };
}

export interface Merchant extends User {
  merchant_type: string;
  city: string;
  driver_name: string;
  mate_id?: string;
  mate_name?: string;
  mate_phone_number?: string;
  drivers_license_number: string;
  license_plate_number: string;
  pin: string;
  active_route: Route;
  verified: boolean;
  restricted: boolean;
  requireNewPin?: boolean;
  requireActiveRoute: boolean;
}
