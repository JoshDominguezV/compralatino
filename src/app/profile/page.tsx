import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import prisma from '@/infrastructure/database/prismaClient';
import { ProfileForm } from '@/components/profile/ProfileForm';

export default async function ProfilePage({ searchParams }: { searchParams: { next?: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?next=/profile');
  let returnTo: string | undefined;
  try {
    const destination = new URL(searchParams.next ?? '', 'http://compralatino.local');
    const path = `${destination.pathname}${destination.search}${destination.hash}`;
    if (destination.origin === 'http://compralatino.local' && path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/\\')) returnTo = path;
  } catch { returnTo = undefined; }
  let user: { name: string | null; email: string; mfaEnabled: boolean; profile: { shippingAddress: string; phone: string | null; taxId: string | null } | null };
  let unavailable = false;
  try { user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id }, include: { profile: true } }); }
  catch { unavailable = true; user = { name: session.user.name ?? '', email: session.user.email ?? '', mfaEnabled: false, profile: null }; }
  return <main className="page-wrap"><div className="page-content"><div className="dashboard-heading"><div><span className="section-kicker">Tu espacio</span><h1>Mi perfil</h1><p>Actualiza los datos de tu cuenta y la dirección para tus entregas.</p></div><Link className="button-outline" href="/orders">Ver mis compras</Link></div><div className="admin-panel" style={{ maxWidth: 600 }}>{unavailable ? <div className="empty-state" role="alert"><strong>No pudimos cargar tu perfil.</strong><p>Revisa la conexión con la base de datos e inténtalo de nuevo.</p><Link className="button-outline" href="/profile">Volver a intentar</Link></div> : <><p style={{ color: '#707a73', fontSize: 12 }}>Correo: <strong>{user.email}</strong></p><ProfileForm initial={{ name: user.name ?? '', shippingAddress: user.profile?.shippingAddress ?? '', phone: user.profile?.phone ?? '', taxId: user.profile?.taxId ?? '', mfaEnabled: user.mfaEnabled }} returnTo={returnTo} /></>}</div></div></main>;
}
