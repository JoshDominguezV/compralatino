'use client';

import Link from 'next/link';
import { Heart, ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/catalog/ProductCard';
import { useFavorites } from '@/components/shared/FavoritesProvider';
import type { CatalogProduct } from '@/modules/catalog/catalog-data';

export function FavoritesView({ products }: { products: CatalogProduct[] }) {
  const { favorites, ready } = useFavorites();
  const saved = products.filter((product) => favorites.includes(product.id));
  return <main className="page-wrap"><div className="page-content favorites-page"><div className="dashboard-heading"><div><span className="section-kicker">Tu selección</span><h1>Guardados para después</h1><p>Las piezas que te gustaron, reunidas en un solo lugar.</p></div><span className="favorites-total"><Heart size={15} /> {saved.length} {saved.length === 1 ? 'artículo' : 'artículos'}</span></div>
    {!ready ? <div className="favorites-loading" role="status">Cargando tus artículos guardados…</div> : saved.length ? <div className="product-grid">{saved.map((product, index) => <ProductCard key={product.id} product={product} rank={index + 1} />)}</div> : <div className="favorites-empty"><span className="favorites-empty-icon"><Heart size={22} /></span><h2>Tu próxima pieza favorita te espera.</h2><p>Toca el corazón de cualquier artículo para guardarlo aquí.</p><Link href="/#catalogo" className="button-primary">Explorar artículos <ArrowRight size={15} /></Link></div>}
  </div></main>;
}
