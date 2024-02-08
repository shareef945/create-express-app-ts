import { Merchant } from "./users";

export interface Route {
  id: string;
  merchant_id: string;
  start_location: string;
  end_location: string;
  fare: number;
  is_active?: boolean;
  last_modified: string | number;
  created_at: string | number;
}
export interface ActiveRouteRequest {
  merchant_id: string;
  route_id: string;
}

export const defaultMerchant: Partial<Merchant> = {
  city: "",
  name: "",
  pin: "",
  active_route: {
    id: "",
    merchant_id: "",
    start_location: "",
    end_location: "",
    fare: 0,
    last_modified: "",
    created_at: "",
  },
  verified: false,
  restricted: false,
};
