import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import prisma from '@/infrastructure/database/prismaClient';

const statusLabels: Record<string, string> = { PENDING: 'Pendiente', PAID: 'Pago autorizado', EXECUTED_IN_JAPAN: 'Comprado en Japón', IN_TRANSIT: 'En tránsito', DELIVERED: 'Entregado', FAILED: 'Pago liberado', CANCELLED: 'Cancelado' };

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?next=/orders');
  const result = await prisma.order.findMany({ where: { userId: session.user.id }, include: { items: { include: { product: true } } }, orderBy: { createdAt: 'desc' }, take: 50 }).then((orders) => ({ orders, unavailable: false as const })).catch(() => ({ orders: [], unavailable: true as const }));
  const { orders, unavailable } = result;
  return <main className="page-wrap"><div className="page-content"><div className="dashboard-heading"><div><span className="section-kicker">Tu cuenta</span><h1>Mis compras</h1><p>Seguimiento de tus órdenes desde Japón hasta tu puerta.</p></div><Link className="button-primary" href="/#catalogo">Explorar artículos</Link></div>
    {unavailable ? <div className="empty-state" role="alert"><strong>No pudimos cargar tus compras.</strong><p>Comprueba la conexión e inténtalo de nuevo.</p><Link className="button-outline" href="/orders">Volver a intentar</Link></div> : orders.length ? <div className="admin-panel"><div className="table-scroll"><table className="data-table"><thead><tr><th>Artículo</th><th>Fecha</th><th>Total</th><th>Estado</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td>{order.items.map((item) => item.product.title).join(', ')}</td><td>{new Date(order.createdAt).toLocaleDateString('es')}</td><td>${Number(order.totalAmount).toLocaleString('en-US')} {order.currency}</td><td><span className="status-badge">{statusLabels[order.status] ?? order.status}</span></td></tr>)}</tbody></table></div></div> : <div className="empty-state"><strong>Todavía no tienes compras.</strong><p>Japón tiene grandes hallazgos esperándote.</p><Link href="/#catalogo" className="button-primary" style={{ marginTop: 8 }}>Explorar catálogo</Link></div>}
  </div></main>;
}
