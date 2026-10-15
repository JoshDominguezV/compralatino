import Link from 'next/link';

export default function NotFound() {
  return <main className="page-wrap"><div className="page-content" style={{ textAlign: 'center', paddingTop: 110, paddingBottom: 110 }}><span className="section-kicker">404 · Artículo no encontrado</span><h1 style={{ font: '500 40px Georgia,serif' }}>Esta pieza ya no está aquí.</h1><p style={{ color: '#747d77' }}>Puede que la subasta haya terminado. Explora el catálogo para encontrar otra.</p><Link href="/#catalogo" className="button-primary" style={{ marginTop: 14 }}>Volver al catálogo</Link></div></main>;
}
