import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowUpRight, Boxes, CircleDollarSign, Gavel, PackageCheck, UsersRound } from 'lucide-react';
import { auth } from '@/auth';
import prisma from '@/infrastructure/database/prismaClient';

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?next=/admin');
  if (session.user.role !== 'ADMIN' && session.user.role !== 'OPERATOR') return <main className="page-wrap"><div className="page-content"><div className="empty-state">Esta sección está disponible para el equipo de CompraLatino.<br /><Link href="/" className="button-outline" style={{ marginTop: 18 }}>Volver a la tienda</Link></div></div></main>;

  let totalRevenue = 0; let orderCount = 0; let userCount = 0; let productCount = 0; let unavailable = false; let categoryRows: { category: string; _count: { _all: number } }[] = []; let recentOrders: { id: string; status: string; totalAmount: unknown; createdAt: Date; user: { email: string } }[] = [];
  try {
    const [revenue, orders, users, products, categories, recent] = await Promise.all([
      prisma.order.aggregate({ where: { status: 'EXECUTED_IN_JAPAN' }, _sum: { totalAmount: true }, _count: true }),
      prisma.order.count(), prisma.user.count(), prisma.externalProduct.count({ where: { isActive: true } }),
      prisma.externalProduct.groupBy({ by: ['category'], _count: { _all: true }, orderBy: { _count: { category: 'desc' } } }),
      prisma.order.findMany({ take: 6, orderBy: { createdAt: 'desc' }, include: { user: { select: { email: true } } } })
    ]);
    totalRevenue = Number(revenue._sum.totalAmount ?? 0); orderCount = orders; userCount = users; productCount = products; categoryRows = categories; recentOrders = recent;
  } catch { unavailable = true; }
  const maxCategoryCount = Math.max(1, ...categoryRows.map((row) => row._count._all));
  const dashboardId = process.env.METABASE_DASHBOARD_ID;
  const metabaseBase = process.env.NEXT_PUBLIC_METABASE_URL ?? 'http://localhost:3000';
  return <main className="page-wrap"><div className="page-content"><div className="dashboard-heading"><div><span className="section-kicker">Operaciones · CompraLatino</span><h1>Panel de control</h1><p>El negocio de un vistazo. Datos actualizados desde tus órdenes.</p></div><a className="button-outline" href={`${metabaseBase}/`} target="_blank" rel="noreferrer">Abrir Metabase <ArrowUpRight size={14} /></a></div>
    {unavailable && <div className="empty-state admin-data-warning" role="alert"><strong>Métricas temporalmente no disponibles.</strong><p>Verifica la conexión de PostgreSQL y vuelve a cargar esta página.</p><Link className="button-outline" href="/admin">Reintentar</Link></div>}
    <div className="metric-grid"><div className="metric-card"><span><CircleDollarSign size={14} style={{ verticalAlign: '-3px' }} /> Ingresos ejecutados</span><strong>{unavailable ? '—' : `$${totalRevenue.toLocaleString('en-US')}`}</strong><small>Órdenes ejecutadas en Japón</small></div><div className="metric-card"><span><PackageCheck size={14} style={{ verticalAlign: '-3px' }} /> Órdenes</span><strong>{unavailable ? '—' : orderCount}</strong><small>Todos los estados</small></div><div className="metric-card"><span><UsersRound size={14} style={{ verticalAlign: '-3px' }} /> Clientes</span><strong>{unavailable ? '—' : userCount}</strong><small>Cuentas registradas</small></div><div className="metric-card"><span><Boxes size={14} style={{ verticalAlign: '-3px' }} /> Catálogo activo</span><strong>{unavailable ? '—' : productCount}</strong><small><Gavel size={11} style={{ verticalAlign: '-2px' }} /> Sincronizado desde Japón</small></div></div>
    <div className="admin-panel"><h2>Artículos por categoría</h2>{categoryRows.length ? <div style={{ display: 'grid', gap: 15 }}>{categoryRows.map((row) => <div key={row.category} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 35px', gap: 12, alignItems: 'center', fontSize: 11 }}><span>{row.category}</span><span style={{ height: 8, background: '#f0f0eb', borderRadius: 9, overflow: 'hidden' }}><span style={{ display: 'block', width: `${row._count._all / maxCategoryCount * 100}%`, height: '100%', background: '#dc5a3a' }} /></span><strong>{row._count._all}</strong></div>)}</div> : <p style={{ color: '#707a73', fontSize: 12 }}>{unavailable ? 'No se pudieron leer las categorías.' : 'Ejecuta la semilla de datos para visualizar la distribución del catálogo.'}</p>}</div>
    <div className="admin-panel"><h2>Órdenes recientes</h2>{recentOrders.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>Orden</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th></tr></thead><tbody>{recentOrders.map((order) => <tr key={order.id}><td>#{order.id.slice(0, 8)}</td><td>{order.user.email}</td><td>{new Date(order.createdAt).toLocaleDateString('es')}</td><td>${Number(order.totalAmount).toLocaleString('en-US')}</td><td><span className="status-badge">{order.status.replaceAll('_', ' ')}</span></td></tr>)}</tbody></table></div> : <p style={{ color: '#707a73', fontSize: 12 }}>{unavailable ? 'No se pudieron cargar las órdenes.' : 'No hay órdenes registradas todavía.'}</p>}</div>
    <div className="admin-panel"><h2>Business Intelligence</h2>{dashboardId ? <iframe className="admin-frame" src={`${metabaseBase}/public/dashboard/${dashboardId}`} title="Panel de inteligencia de negocios CompraLatino" /> : <div className="empty-state">Metabase está listo en <a href={metabaseBase} target="_blank" rel="noreferrer">{metabaseBase}</a>. Configura una base de datos y define <code>METABASE_DASHBOARD_ID</code> para incrustar un dashboard.</div>}</div>
  </div></main>;
}
