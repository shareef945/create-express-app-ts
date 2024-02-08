export interface Transaction {
  id: string;
  transaction_type: string;
  type_id?: string;
  amount: number;
  currency: string;
  sender_id: string;
  merchant_id: string;
  paymemt_method: string;
  transaction_status: string;
  transaction_created: string | number;
  transaction_settled: string | number;
}
