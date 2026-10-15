'use client';

import Link from 'next/link';
import { RefreshCw } from 'lucide-react';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="page-wrap"><div className="page-content route-error" role="alert">
    <span className="section-kicker">Algo no salió como esperábamos</span>
    <h1>Estamos recuperando la conexión.</h1>
    <p>Intenta cargar esta sección otra vez. Si estabas procesando una compra, revisa primero “Mis compras” antes de volver a intentarlo.</p>
    <div><button className="button-primary" onClick={() => reset()}><RefreshCw size={15} /> Reintentar</button><Link href="/" className="button-outline">Volver a la tienda</Link></div>
  </div></main>;
}
