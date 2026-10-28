import httpClient from './httpClient';

export type TxnStatus = 'successful' | 'pending' | 'failed' | 'refunded';

export interface AdminPaymentTxn {
  id: string;
  orderId: string;
  orderNumber: string;
  customer: string;
  email: string | null;
  phone: string | null;
  country: string;
  method: string;
  amount: number;
  date: string;
  status: TxnStatus;
  orderStatus: string;
  verified: boolean;
}

interface RawPayment {
  id: string;
  orderId: string;
  orderNumber: string;
  customer: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  countryCode: string;
  method: string;
  status: string;
  amount: number | string;
  date: string;
  orderStatus: string;
}

const STATUS_MAP: Record<string, TxnStatus> = {
  SUCCESS: 'successful',
  PENDING: 'pending',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

const METHOD_MAP: Record<string, string> = {
  'Cash on Delivery': 'COD',
};

export async function listPayments(): Promise<AdminPaymentTxn[]> {
  const { data } = await httpClient.get<RawPayment[]>('/api/admin/payments');
  return data.map((p) => {
    const status: TxnStatus = STATUS_MAP[p.status] ?? 'pending';
    return {
      id: p.id,
      orderId: p.orderId,
      orderNumber: p.orderNumber,
      customer: p.customer || p.customerPhone || p.customerEmail || 'Unknown customer',
      email: p.customerEmail,
      phone: p.customerPhone,
      country: p.countryCode,
      method: METHOD_MAP[p.method] ?? p.method,
      amount: Number(p.amount),
      date: p.date,
      status,
      orderStatus: p.orderStatus,
      verified: status === 'successful',
    };
  });
}
