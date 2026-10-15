import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, Gavel } from 'lucide-react';
import { auth } from '@/auth';
import prisma from '@/infrastructure/database/prismaClient';
import { priceInUsd } from '@/modules/catalog/pricing';

const statusLabels: Record<string, string> = { PLACED: 'Puja enviada', WON: 'Subasta ganada', LOST: 'Subasta cerrada', CANCELLED: 'Cancelada' };

export default async function BidsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?next=/bids');

  let bids: Awaited<ReturnType<typeof prisma.bidTransaction.findMany>> = [];
  let unavailable = false;
  try {
    bids = await prisma.bidTransaction.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 50 });
  } catch { unavailable = true; }

  const products = bids.length ? await prisma.externalProduct.findMany({ where: { externalAuctionId: { in: bids.map((bid) => bid.auctionId) } } }).catch(() => []) : [];
  const productByAuctionId = new Map(products.map((product) => [product.externalAuctionId, product]));

  return <main className="page-wrap"><div className="page-content">
    <div className="dashboard-heading"><div><span className="section-kicker">Tu actividad</span><h1>Mis pujas</h1><p>Consulta los máximos que has enviado a las subastas de Japón.</p></div><Link className="button-primary" href="/?tipo=auction#catalogo">Explorar subastas <ArrowRight size={14} /></Link></div>
    {unavailable ? <div className="empty-state" role="alert"><strong>No pudimos cargar tus pujas.</strong><p>Inténtalo de nuevo en unos momentos.</p></div> : bids.length ? <div className="admin-panel"><div className="table-scroll"><table className="data-table"><thead><tr><th>Artículo</th><th>Máximo enviado</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>{bids.map((bid) => {
      const product = productByAuctionId.get(bid.auctionId);
      const amountJpy = Number(bid.bidAmountJpy);
      return <tr key={bid.id}><td>{product ? <Link className="bid-product-link" href={`/product/${product.externalAuctionId}`}>{product.title}</Link> : 'Artículo de subasta'}</td><td>¥{amountJpy.toLocaleString('ja-JP')}<small className="bid-usd-estimate">≈ ${priceInUsd(amountJpy).toLocaleString('en-US')} USD</small></td><td>{new Date(bid.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}</td><td><span className="status-badge">{statusLabels[bid.status] ?? bid.status}</span></td></tr>;
    })}</tbody></table></div></div> : <div className="favorites-empty"><span className="favorites-empty-icon"><Gavel size={22} /></span><h2>Aún no tienes pujas.</h2><p>Cuando encuentres una pieza, tu actividad aparecerá aquí.</p><Link href="/?tipo=auction#catalogo" className="button-primary">Explorar subastas <ArrowRight size={15} /></Link></div>}
  </div></main>;
}
