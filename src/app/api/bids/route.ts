import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/infrastructure/database/prismaClient';
import { bidSchema } from '@/modules/checkout/schemas';
import { placeYAuctionsBid } from '@/infrastructure/yauctions/yauctionsAdapter';
import { cacheDelete, rateLimit, requestAddress } from '@/infrastructure/cache/redisClient';
import { priceInUsd, usdToYen } from '@/modules/catalog/pricing';

export async function POST(request: Request) {
  if (!await rateLimit(`bid:${requestAddress(request)}`, 20, 300)) return NextResponse.json({ error: 'Has alcanzado el límite de pujas. Inténtalo más tarde.' }, { status: 429 });
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Inicia sesión para pujar.' }, { status: 401 });
  const parsed = bidSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Monto de puja inválido.' }, { status: 400 });
  const product = await prisma.externalProduct.findUnique({ where: { externalAuctionId: parsed.data.auctionId } });
  if (!product || !product.isActive) return NextResponse.json({ error: 'Esta subasta ya no está disponible.' }, { status: 404 });
  if (product.isBuyNow) return NextResponse.json({ error: 'Este artículo está disponible para compra directa, no para puja.' }, { status: 409 });
  if (!product.endAt || product.endAt <= new Date()) return NextResponse.json({ error: 'El periodo de puja ya terminó.' }, { status: 409 });
  if (parsed.data.amount < priceInUsd(Number(product.priceJpy))) return NextResponse.json({ error: 'Tu puja máxima debe cubrir el precio actual estimado.' }, { status: 400 });
  const amountJpy = usdToYen(parsed.data.amount);
  const result = await placeYAuctionsBid(product.externalAuctionId, amountJpy);
  if (!result.success) return NextResponse.json({ error: 'No se pudo registrar la puja.' }, { status: 502 });
  const bid = await prisma.bidTransaction.create({ data: { userId: session.user.id, auctionId: product.externalAuctionId, bidAmountJpy: amountJpy } });
  await prisma.recommendationMetric.upsert({ where: { userId_category: { userId: session.user.id, category: product.category } }, create: { userId: session.user.id, category: product.category, affinityWeight: 1 }, update: { affinityWeight: { increment: 1 } } }).catch(() => undefined);
  await cacheDelete('catalog:active:v3');
  return NextResponse.json({ bid }, { status: 201 });
}
