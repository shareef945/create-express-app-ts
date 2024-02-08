import axios from "axios";
import { HUBTEL_CLIENT_ID, HUBTEL_CLIENT_SECRET, HUBTEL_SENDER_REFERENCE } from "../config/config";
import { formatToMsisdn } from "../utils/utils";
import { endpoints } from "../config/endpoints";

export async function sendSMS(to: string, message: string) {
  const query = new URLSearchParams({
    clientid: HUBTEL_CLIENT_ID,
    clientsecret: HUBTEL_CLIENT_SECRET,
    from: HUBTEL_SENDER_REFERENCE,
    to: formatToMsisdn(to),
    content: message,
  }).toString();
  try {
    const response = await axios.get(endpoints.hubtel.smsApi + `${query}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
}
