export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired';

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  status: PaymentStatus;
  provider: string;
  provider_order_id: string | null;
  payment_method: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}