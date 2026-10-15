import Link from 'next/link';
import { ArrowDownRight, ArrowRight, ArrowUpRight, BadgeCheck, Box, CircleDollarSign, Globe2, PackageCheck, ShieldCheck, Sparkles } from 'lucide-react';
import { Catalog } from '@/components/catalog/Catalog';
import { demoProducts, getProducts } from '@/modules/catalog/products';
import { priceInUsd } from '@/modules/catalog/pricing';

export default async function Home({ searchParams }: { searchParams: { q?: string; tipo?: string; categoria?: string } }) {
  let products = demoProducts;
  try { products = await getProducts(); } catch {}
  const featured = products.find((product) => product.featured) ?? products[0];
  const auctions = products.filter((product) => !product.buyNow && Number.isFinite(Date.parse(product.endAt)) && Date.parse(product.endAt) > Date.now()).length;
  const categoryTiles = ['Cámaras', 'Coleccionables', 'Audio', 'Moda'].map((category) => ({ name: category, product: products.find((item) => item.category === category) })).filter((item) => item.product);

  return <main>
    <section className="home-hero"><div className="hero-grain" /><div className="home-hero-inner">
      <div className="hero-copy"><span className="hero-overline"><span className="hero-overline-dot" /> EL OTRO LADO DEL MERCADO</span><h1>Un poco de Japón.<br /><em>Muy cerca</em> de ti.</h1><p>Subastas, objetos de colección y hallazgos especiales. Los encontramos en Japón; tú eliges cuáles llegan a casa.</p><div className="hero-actions"><Link href="#catalogo" className="hero-primary">Explorar selección <ArrowRight size={15} /></Link><Link href="#como-funciona" className="hero-secondary">Así funciona <ArrowDownRight size={15} /></Link></div><div className="hero-proof"><span className="proof-avatars"><i><Globe2 size={13} /></i></span><span><strong>{products.length} hallazgos</strong><small>en selección japonesa</small></span><span className="proof-divider" /><span className="proof-rating"><span>JPY · USD</span><small>Precios estimados</small></span></div></div>
      {featured && <div className="hero-showcase"><Link href={`/product/${featured.id}`} className="hero-feature-image"><img src={featured.imageUrl} alt={featured.title} /><span className="hero-image-label"><Sparkles size={12} /> HALLAZGO DE LA SEMANA</span><span className="hero-image-index">01 <i>/</i> {String(products.length).padStart(2, '0')}</span></Link><div className="hero-feature-caption"><div><span>{featured.category} <b>·</b> {featured.condition}</span><h2>{featured.title}</h2></div><div className="hero-feature-price"><small>DESDE</small><strong>${priceInUsd(featured.priceJpy).toLocaleString('en-US')}</strong><span>USD aprox.</span></div><Link className="hero-feature-arrow" href={`/product/${featured.id}`} aria-label={`Ver ${featured.title}`}><ArrowUpRight size={18} /></Link></div></div>}
    </div><div className="hero-coordinate">35° 40′ 41″ N <span>·</span> TOKYO, JP</div></section>

    <div className="promise-bar"><div className="promise-inner"><span><ShieldCheck size={15} /> Pago de demostración</span><i /><span><Globe2 size={15} /> Precios en USD y JPY</span><i /><span><PackageCheck size={15} /> Seguimiento de tu orden</span><div className="promise-right"><span className="live-dot" /> {auctions} subastas abiertas</div></div></div>

    <section className="category-section"><div className="category-section-head"><div><span className="section-kicker">Un mercado por descubrir</span><h2>¿Qué te gustaría encontrar?</h2></div><Link href="/#catalogo" className="text-link">Todas las categorías <ArrowRight size={14} /></Link></div><div className="category-tiles">{categoryTiles.map(({ name, product }, index) => <Link key={name} href={`/?categoria=${encodeURIComponent(name)}#catalogo`} className={`category-tile category-tile-${index + 1}`}><img src={product!.imageUrl} alt="" loading="lazy" /><span className="category-tile-shade" /><span className="category-tile-number">0{index + 1}</span><span className="category-tile-label">{name}<ArrowUpRight size={16} /></span></Link>)}</div></section>

    <Catalog products={products} initialQuery={searchParams.q ?? ''} initialKind={searchParams.tipo ?? 'all'} initialCategory={searchParams.categoria ?? 'Todo'} />

    <section id="como-funciona" className="how-section"><div className="how-inner"><div className="how-intro"><span className="section-kicker">Sencillo desde el primer paso</span><h2>Japón se siente<br /><em>más cerca</em> así.</h2><p>Nos ocupamos del idioma, la puja y la compra en Japón. Tú decides qué quieres descubrir.</p><Link href="/register" className="how-link">Empieza a explorar <ArrowRight size={14} /></Link><span className="how-japanese" lang="ja">遠くても、近くに。</span></div><div className="how-steps"><article><span className="how-step-number">01</span><span className="how-step-icon"><Sparkles size={18} /></span><h3>Encuentra algo especial</h3><p>Explora el catálogo de subastas y tiendas japonesas desde una experiencia en español.</p><span className="how-step-note">YAuctions · Japón</span></article><article><span className="how-step-number">02</span><span className="how-step-icon"><CircleDollarSign size={18} /></span><h3>Compra con claridad</h3><p>Consulta el precio estimado en dólares y deja tu puja o solicita la compra directa.</p><span className="how-step-note">USD + JPY · Sin sorpresas</span></article><article><span className="how-step-number">03</span><span className="how-step-icon"><Box size={18} /></span><h3>Recíbelo en casa</h3><p>Te acompañamos con seguimiento desde Japón hasta el destino en Latinoamérica.</p><span className="how-step-note">Seguimiento · Puerta a puerta</span></article></div></div></section>

    <section className="closing-note"><div><BadgeCheck size={18} /><span>Una compra especial merece un proceso claro.</span></div><Link href="/register">Crea tu cuenta y empieza <ArrowRight size={14} /></Link></section>
  </main>;
}
