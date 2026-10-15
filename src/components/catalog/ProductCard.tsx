'use client';

import Link from 'next/link';
import { Heart, Check, Gavel, ArrowUpRight } from 'lucide-react';
import type { CatalogProduct } from '@/modules/catalog/catalog-data';
import { priceInUsd } from '@/modules/catalog/pricing';
import { useFavorites } from '@/components/shared/FavoritesProvider';

export function ProductCard({ product, rank }: { product: CatalogProduct; rank?: number }) {
  const { isFavorite, ready, toggleFavorite } = useFavorites();
  const saved = isFavorite(product.id);
  const auctionClosed = !product.buyNow && (!Number.isFinite(Date.parse(product.endAt)) || Date.parse(product.endAt) <= Date.now());
  return <article className="product-card"><div className="product-image-wrap">
    <Link href={`/product/${product.id}`} aria-label={`Ver ${product.title}`}><img className="product-image" src={product.imageUrl} alt={product.title} loading={rank !== undefined && rank > 4 ? 'lazy' : 'eager'} /></Link>
    <span className={`product-tag ${product.buyNow ? 'tag-direct' : auctionClosed ? 'tag-closed' : 'tag-auction'}`}>{product.buyNow ? 'Compra directa' : auctionClosed ? 'Subasta finalizada' : <><span className="live-dot" /> Subasta</>}</span>
    <button className={`heart-button ${saved ? 'saved' : ''}`} onClick={() => toggleFavorite(product.id)} aria-label={saved ? 'Quitar de favoritos' : 'Guardar en favoritos'} aria-pressed={saved} disabled={!ready}><Heart size={16} fill={saved ? 'currentColor' : 'none'} /></button>
    <Link className="product-open-link" href={`/product/${product.id}`}>Ver artículo <ArrowUpRight size={14} /></Link>
  </div><div className="product-info"><span className="product-category">{product.category}</span><Link href={`/product/${product.id}`} className="product-title">{product.title}</Link>
    <div className="product-price-row"><div><span className="product-price">${priceInUsd(product.priceJpy).toLocaleString('en-US')}</span><span className="product-original">USD aprox.</span></div><span className="bid-count">{!product.buyNow && <><Gavel size={11} style={{ verticalAlign: '-2px' }} /> {product.bids}</>}</span></div>
    <div className="product-condition"><Check size={12} /> {product.condition}<span className="condition-origin">· Japón</span></div>
  </div></article>;
}
