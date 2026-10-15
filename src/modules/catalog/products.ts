import { demoProducts, type CatalogProduct } from '@/modules/catalog/catalog-data';
export { demoProducts, categories } from '@/modules/catalog/catalog-data';
export type { CatalogProduct } from '@/modules/catalog/catalog-data';
export async function getProducts() {
  const { cacheGet, cacheSet } = await import('@/infrastructure/cache/redisClient');
  const cached = await cacheGet<CatalogProduct[]>('catalog:active:v3');
  if (cached?.length) return cached;
  const { default: prisma } = await import('@/infrastructure/database/prismaClient');
  try {
    const [products, bidCounts] = await Promise.all([
      prisma.externalProduct.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } }),
      prisma.bidTransaction.groupBy({ by: ['auctionId'], _count: { _all: true } })
    ]);
    if (!products.length) return demoProducts;
    const bidCountByAuctionId = new Map(bidCounts.map((entry) => [entry.auctionId, entry._count._all]));
    const normalized = products.map((product) => ({ ...product, id: product.externalAuctionId, priceJpy: Number(product.priceJpy), endAt: product.endAt?.toISOString() ?? '', bids: bidCountByAuctionId.get(product.externalAuctionId) ?? 0, buyNow: product.isBuyNow, featured: product.isFeatured }));
    await cacheSet('catalog:active:v3', normalized, 60);
    return normalized;
  } catch { return demoProducts; }
}
