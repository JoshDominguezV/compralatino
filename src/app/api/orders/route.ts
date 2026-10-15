import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/infrastructure/database/prismaClient';
import { purchaseSchema } from '@/modules/checkout/schemas';
import { CheckoutError, processPurchase } from '@/modules/checkout/processPurchase';
import { rateLimit, requestAddress } from '@/infrastructure/cache/redisClient';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Inicia sesión para ver tus compras.' }, { status: 401 });
  const orders = await prisma.order.findMany({ where: session.user.role === 'ADMIN' ? undefined : { userId: session.user.id }, include: { items: { include: { product: true } } }, orderBy: { createdAt: 'desc' }, take: 50 });
  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  if (!await rateLimit(`order:${requestAddress(request)}`, 8, 300)) return NextResponse.json({ error: 'Límite de compras alcanzado. Inténtalo más tarde.' }, { status: 429 });
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Inicia sesión para comprar.' }, { status: 401 });
  const parsed = purchaseSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Solicitud de compra inválida.' }, { status: 400 });
  try { return NextResponse.json({ order: await processPurchase(session.user.id, parsed.data.productId, parsed.data.quantity) }, { status: 201 }); }
  catch (error) {
    if (error instanceof CheckoutError) return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    return NextResponse.json({ error: 'No se pudo completar la compra. Revisa tus órdenes antes de volver a intentarlo.' }, { status: 502 });
  }
}
