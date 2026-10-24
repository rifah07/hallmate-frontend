export type Bill = {
  id: string;
  type: string;
  status: 'UNPAID' | 'PAID' | 'CANCELLED';
  title: string;
  period: string;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  isOverdue: boolean;
  student?: { name: string; universityId: string };
};

// Only ever send the browser to the real payment gateway, whatever the API returns
export const isGatewayUrl = (url: string) => {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === 'https:' && (hostname === 'sslcommerz.com' || hostname.endsWith('.sslcommerz.com'));
  } catch {
    return false;
  }
};
