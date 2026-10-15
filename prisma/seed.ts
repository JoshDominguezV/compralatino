import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { demoProducts } from '../src/modules/catalog/products';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@compralatino.local';
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: UserRole.ADMIN },
    create: { name: 'Administración CompraLatino', email: adminEmail, passwordHash: await bcrypt.hash('CompraLatino2026', 12), role: UserRole.ADMIN }
  });
  await prisma.customerProfile.upsert({ where: { userId: admin.id }, update: {}, create: { userId: admin.id } });

  for (const product of demoProducts) {
    await prisma.externalProduct.upsert({
      where: { externalAuctionId: product.id },
      update: { title: product.title, description: product.description, priceJpy: product.priceJpy, category: product.category, imageUrl: product.imageUrl, isBuyNow: Boolean(product.buyNow), isFeatured: Boolean(product.featured), endAt: product.endAt ? new Date(product.endAt) : null },
      create: { externalAuctionId: product.id, title: product.title, description: product.description ?? `Artículo ${product.condition.toLowerCase()} publicado por ${product.seller} en Japón. Compra intermediada por CompraLatino.`, priceJpy: product.priceJpy, category: product.category, imageUrl: product.imageUrl, condition: product.condition, seller: product.seller, endAt: product.endAt ? new Date(product.endAt) : null, isBuyNow: Boolean(product.buyNow), isFeatured: Boolean(product.featured) }
    });
  }

  const revenue = await prisma.order.aggregate({ where: { status: 'EXECUTED_IN_JAPAN' }, _sum: { totalAmount: true } });
  if (Number(revenue._sum.totalAmount ?? 0) === 0) {
    const firstProducts = await prisma.externalProduct.findMany({ take: 3, orderBy: { createdAt: 'asc' } });
    if (firstProducts.length >= 3) {
      for (const [index, product] of firstProducts.entries()) {
        const orderId = `demo-order-${index + 1}`;
        await prisma.order.upsert({ where: { id: orderId }, update: {}, create: { id: orderId, userId: admin.id, status: 'EXECUTED_IN_JAPAN', totalAmount: Math.ceil(Number(product.priceJpy) * 0.0067 * 1.12), paymentRef: `seed-payment-${index + 1}`, items: { create: { externalProductId: product.id, unitPrice: Math.ceil(Number(product.priceJpy) * 0.0067 * 1.12), quantity: 1 } } } });
      }
    }
  }
  console.info(`Semilla lista: ${demoProducts.length} productos y administrador ${adminEmail}`);
}

main().finally(async () => prisma.$disconnect());
