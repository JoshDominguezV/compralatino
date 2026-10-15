export type PaymentAuthorization = { success: boolean; reference: string };

export async function authorizePayment(userId: string, amount: number): Promise<PaymentAuthorization> {
  if (!Number.isFinite(amount) || amount <= 0 || !userId) return { success: false, reference: '' };
  return { success: true, reference: `demo-pay-${crypto.randomUUID()}` };
}

export async function releasePayment(reference: string): Promise<void> {
  if (reference) console.info('Compensation applied to demo payment', reference);
}
