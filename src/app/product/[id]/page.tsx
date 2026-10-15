import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Clock3, Gavel, MapPin, ShieldCheck } from 'lucide-react';
import { BidForm } from '@/components/catalog/BidForm';
import { PurchaseButton } from '@/components/catalog/PurchaseButton';
import { demoProducts, getProducts } from '@/modules/catalog/products';
import { priceInUsd } from '@/modules/catalog/pricing';

export default async function ProductPage({ params }: { params: { id: string } }) {
  let products = demoProducts;
  try { products = await getProducts(); } catch {}
  const product = products.find((item) => item.id === params.id);
  if (!product) notFound();
  const direct = Boolean(product.buyNow);
  const auctionOpen = !direct && Number.isFinite(Date.parse(product.endAt)) && Date.parse(product.endAt) > Date.now();
  return <main className="page-wrap"><div className="page-content"><div className="breadcrumb"><Link href="/#catalogo" style={{ color: 'inherit', textDecoration: 'none' }}><ArrowLeft size={12} style={{ verticalAlign: '-2px' }} /> Volver al catálogo</Link><span>/</span>{product.category}</div>
    <div className="product-detail"><div className="detail-media"><div className="detail-image-frame"><img className="detail-image" src={product.imageUrl} alt={product.title} /><span className="detail-image-note"><MapPin size={13} /> Publicado en Japón</span></div><div className="detail-image-caption"><span>COMPRA LATINO <i>·</i> SELECCIÓN JAPONESA</span><span>REF. {product.id.toUpperCase()}</span></div><div className="detail-box detail-assurances"><strong>Compra con información clara</strong><div className="detail-box-row"><span><ShieldCheck size={14} /> Pago</span><span>Modo demostración</span></div><div className="detail-box-row"><span><MapPin size={14} /> Envío internacional</span><span>Cotizado aparte</span></div><div className="detail-box-row"><span><Check size={14} /> Estado del artículo</span><span>Según el vendedor</span></div></div></div>
      <div className="detail-copy"><span className="section-kicker">{product.category} <i>·</i> {direct ? 'Compra directa' : auctionOpen ? 'Subasta abierta' : 'Subasta finalizada'}</span><h1>{product.title}</h1><div className="product-condition"><Check size={13} /> {product.condition} <span>·</span> <MapPin size={13} /> Japón</div><p className="detail-description">{product.description ?? 'Artículo publicado en Japón. Compra desde Latinoamérica en español y recibe seguimiento en cada etapa de tu pedido.'}</p>
        <section className="detail-buy-panel" aria-label="Precio y compra"><div className="detail-price-label">{direct ? 'PRECIO DE COMPRA' : auctionOpen ? 'PUJA ACTUAL / DESDE' : 'PRECIO FINAL'}</div><div className="detail-price">${priceInUsd(product.priceJpy).toLocaleString('en-US')} <span>USD</span></div><div className="detail-subprice">¥{product.priceJpy.toLocaleString('ja-JP')} JPY <i>·</i> estimado con servicio de compra</div>
          {!direct && <div className="detail-box detail-auction-box"><div className="detail-box-row"><span><Clock3 size={14} /> {auctionOpen ? 'Cierre estimado' : 'Estado'}</span><strong>{auctionOpen ? new Date(product.endAt).toLocaleDateString('es-SV', { day: 'numeric', month: 'long' }) : 'Puja cerrada'}</strong></div><div className="detail-box-row"><span><Gavel size={14} /> Pujas registradas</span><strong>{product.bids}</strong></div></div>}
          <p className="price-disclaimer">El envío internacional e impuestos se cotizan por separado antes del despacho.</p><div className="detail-actions">{direct ? <PurchaseButton productId={product.id} amountUsd={priceInUsd(product.priceJpy)} /> : auctionOpen ? <BidForm auctionId={product.id} startingPriceJpy={product.priceJpy} /> : <Link href="/#catalogo" className="button-outline">Ver artículos disponibles</Link>}</div></section>
        <div className="detail-seller"><span>VENDEDOR EN JAPÓN</span><strong>{product.seller}</strong></div>
      </div></div></div></main>;
}
