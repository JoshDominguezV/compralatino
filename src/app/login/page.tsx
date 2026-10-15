import Link from 'next/link';
import { Globe2, PackageCheck, ShieldCheck } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';
import { demoProducts } from '@/modules/catalog/products';

export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  const hero = demoProducts[0];
  return <main className="page-wrap"><div className="auth-layout">
    <aside className="auth-art">
      {hero && <img className="auth-art-image" src={hero.imageUrl} alt="" />}
      <Link href="/" className="auth-art-brand">CompraLatino</Link>
      <div className="auth-art-copy">
        <span className="auth-art-overline">EL OTRO LADO DEL MERCADO</span>
        <h2>Un mundo de piezas únicas te espera.</h2>
        <p>Subastas, coleccionables y hallazgos de Japón, con seguimiento en español.</p>
      </div>
      <ul className="auth-art-points">
        <li><ShieldCheck size={14} /> Pago de demostración</li>
        <li><Globe2 size={14} /> Precios en USD y JPY</li>
        <li><PackageCheck size={14} /> Seguimiento de tu orden</li>
      </ul>
    </aside>
    <div className="auth-form-wrap"><div className="auth-card"><LoginForm next={searchParams.next} /></div></div>
  </div></main>;
}
