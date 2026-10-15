'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '@/components/catalog/ProductCard';
import { categories, type CatalogProduct } from '@/modules/catalog/catalog-data';

type CatalogProps = {
  products: CatalogProduct[];
  initialQuery?: string;
  initialKind?: string;
  initialCategory?: string;
};

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function validKind(value: string | null) {
  return value === 'auction' || value === 'direct' ? value : 'all';
}

export function Catalog({ products, initialQuery = '', initialKind = 'all', initialCategory = 'Todo' }: CatalogProps) {
  const [category, setCategory] = useState(categories.includes(initialCategory) ? initialCategory : 'Todo');
  const [kind, setKind] = useState(validKind(initialKind));
  const [sort, setSort] = useState('featured');

  useEffect(() => {
    setCategory(categories.includes(initialCategory) ? initialCategory : 'Todo');
    setKind(validKind(initialKind));
  }, [initialCategory, initialKind]);

  useEffect(() => {
    function syncFilters() {
      const params = new URLSearchParams(window.location.search);
      const nextCategory = params.get('categoria') ?? 'Todo';
      setCategory(categories.includes(nextCategory) ? nextCategory : 'Todo');
      setKind(validKind(params.get('tipo')));
    }
    window.addEventListener('popstate', syncFilters);
    return () => window.removeEventListener('popstate', syncFilters);
  }, []);

  function updateFilters(nextCategory: string, nextKind: string) {
    setCategory(nextCategory);
    setKind(nextKind);
    const url = new URL(window.location.href);
    if (nextCategory === 'Todo') url.searchParams.delete('categoria');
    else url.searchParams.set('categoria', nextCategory);
    if (nextKind === 'all') url.searchParams.delete('tipo');
    else url.searchParams.set('tipo', nextKind);
    const query = url.searchParams.toString();
    window.history.replaceState(null, '', `${url.pathname}${query ? `?${query}` : ''}${url.hash || '#catalogo'}`);
  }

  const filtered = useMemo(() => {
    const query = normalize(initialQuery.trim());
    const matches = products.filter((product) => {
      const matchesCategory = category === 'Todo' || product.category === category;
      const matchesQuery = !query || normalize(`${product.title} ${product.category}`).includes(query);
      const auctionOpen = Number.isFinite(Date.parse(product.endAt)) && Date.parse(product.endAt) > Date.now();
      const matchesKind = kind === 'all' || (kind === 'direct' ? product.buyNow : !product.buyNow && auctionOpen);
      return matchesCategory && matchesQuery && matchesKind;
    });

    return [...matches].sort((left, right) => {
      if (sort === 'price-low') return left.priceJpy - right.priceJpy;
      if (sort === 'price-high') return right.priceJpy - left.priceJpy;
      if (sort === 'ending') {
        const leftEnd = Date.parse(left.endAt);
        const rightEnd = Date.parse(right.endAt);
        return (Number.isFinite(leftEnd) ? leftEnd : Number.POSITIVE_INFINITY) - (Number.isFinite(rightEnd) ? rightEnd : Number.POSITIVE_INFINITY);
      }
      return Number(Boolean(right.featured)) - Number(Boolean(left.featured));
    });
  }, [products, category, kind, sort, initialQuery]);

  return <section id="catalogo" className="section catalog-section">
    <div className="section-heading">
      <div>
        <span className="section-kicker">Selección de esta semana</span>
        <h2>{initialQuery ? `Resultados para “${initialQuery}”` : 'Piezas con una historia propia'}</h2>
        <p>Encontradas en Japón. Seleccionadas para ti.</p>
      </div>
      <Link href="/#catalogo" className="text-link">Explorar todo <ArrowRight size={14} /></Link>
    </div>

    <div className="catalog-tabs" role="group" aria-label="Filtrar por tipo de publicación">
      <button type="button" aria-pressed={kind === 'all'} className={kind === 'all' ? 'selected' : ''} onClick={() => updateFilters(category, 'all')}>Todo <span>{products.length}</span></button>
      <button type="button" aria-pressed={kind === 'auction'} className={kind === 'auction' ? 'selected' : ''} onClick={() => updateFilters(category, 'auction')}>En subasta</button>
      <button type="button" aria-pressed={kind === 'direct'} className={kind === 'direct' ? 'selected' : ''} onClick={() => updateFilters(category, 'direct')}>Compra directa</button>
      <span className="catalog-tabs-note"><span className="live-dot" /> Publicados en Japón · pujas de demostración</span>
    </div>

    <div className="category-row" role="group" aria-label="Filtrar por categoría">
      {categories.map((name) => <button key={name} type="button" className={`category-pill ${category === name ? 'active' : ''}`} aria-pressed={category === name} onClick={() => updateFilters(name, kind)}>{name}</button>)}
    </div>

    <div className="catalog-toolbar">
      <span><SlidersHorizontal size={14} /> <strong>{filtered.length}</strong> artículos disponibles</span>
      <label>Ordenar por <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Recomendados</option><option value="ending">Terminan pronto</option><option value="price-low">Precio: menor a mayor</option><option value="price-high">Precio: mayor a menor</option></select></label>
    </div>

    {filtered.length ? <div className="product-grid">{filtered.map((product, index) => <ProductCard key={product.id} product={product} rank={index + 1} />)}</div> : <div className="empty-state"><strong>No encontramos artículos con esos filtros.</strong><p>Prueba con otra categoría o vuelve a ver toda la selección.</p><Link href="/#catalogo" className="button-outline">Limpiar filtros</Link></div>}
  </section>;
}
