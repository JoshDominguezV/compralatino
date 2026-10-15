import prisma from '@/infrastructure/database/prismaClient';
import { authorizePayment, releasePayment } from '@/infrastructure/payment/localPaymentAdapter';
import { executeYAuctionsPurchase } from '@/infrastructure/yauctions/yauctionsAdapter';
import { priceInUsd } from '@/modules/catalog/pricing';

export class CheckoutError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) {
    super(message);
    this.name = 'CheckoutError';
  }
}

export async function processPurchase(userId: string, productId: string, quantity: number) {
  const product = await prisma.externalProduct.findUnique({ where: { externalAuctionId: productId } });
  if (!product || !product.isActive) throw new CheckoutError('El producto ya no está disponible.', 404, 'PRODUCT_UNAVAILABLE');
  if (!product.isBuyNow) throw new CheckoutError('Este artículo solo se puede adquirir mediante una puja.', 409, 'AUCTION_ONLY');
  const profile = await prisma.customerProfile.findUnique({ where: { userId }, select: { shippingAddress: true } });
  if (!profile?.shippingAddress.trim()) throw new CheckoutError('Agrega una dirección de entrega antes de continuar.', 409, 'SHIPPING_ADDRESS_REQUIRED');
  const total = priceInUsd(Number(product.priceJpy)) * quantity;
  const payment = await authorizePayment(userId, total);
  if (!payment.success) throw new Error('No se pudo autorizar el pago.');

  let orderId = '';
  try {
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({ data: { userId, totalAmount: total, status: 'PAID', paymentRef: payment.reference } });
      await tx.orderItem.create({ data: { orderId: created.id, externalProductId: product.id, unitPrice: total / quantity, quantity } });
      await tx.auditLog.create({ data: { actorId: userId, eventType: 'PAYMENT_AUTHORIZED', correlationId: created.id } });
      return created;
    });
    orderId = order.id;
    const japan = await executeYAuctionsPurchase(product.externalAuctionId);
    if (!japan.success) throw new Error('La compra no fue aceptada en Japón.');
    return await prisma.$transaction(async (tx) => {
      const executed = await tx.order.update({ where: { id: order.id }, data: { status: 'EXECUTED_IN_JAPAN' } });
      await tx.auditLog.create({ data: { actorId: userId, eventType: 'PURCHASE_EXECUTED_JAPAN', correlationId: order.id } });
      return executed;
    });
  } catch (error) {
    if (orderId) {
      await prisma.$transaction([
        prisma.order.update({ where: { id: orderId }, data: { status: 'FAILED' } }),
        prisma.auditLog.create({ data: { actorId: userId, eventType: 'PURCHASE_COMPENSATED', correlationId: orderId } })
      ]).catch(() => undefined);
    }
    await releasePayment(payment.reference);
    throw error;
  }
}
