import Link from 'next/link';

export function SiteFooter() {
  return <footer className="site-footer"><div className="footer-inner">
    <div><Link href="/" className="brand"><span className="brand-mark">C</span><span className="brand-name" style={{ color: 'white' }}>compra<em>latino</em></span></Link><p className="footer-blurb">Explora artículos japoneses desde Latinoamérica con información clara en cada paso. Este entorno utiliza pagos y pujas de demostración.</p></div>
    <div className="footer-column"><strong>Explora</strong><a href="/#catalogo">Todo el catálogo</a><a href="/?tipo=auction#catalogo">Subastas activas</a><a href="/?categoria=Coleccionables#catalogo">Coleccionables</a></div>
    <div className="footer-column"><strong>Tu cuenta</strong><Link href="/bids">Mis pujas</Link><Link href="/orders">Mis compras</Link><Link href="/register">Crear cuenta</Link><Link href="/login">Iniciar sesión</Link></div>
    <div className="footer-column"><strong>Compra con confianza</strong><a href="/#como-funciona">Cómo funciona</a><a href="/#como-funciona">Envíos y aduanas</a><a href="/#como-funciona">Ayuda y contacto</a></div>
  </div><div className="footer-bottom"><span>© 2026 CompraLatino. Japón, más cerca de ti.</span><span>Hecho para Latinoamérica · Precios estimados en USD</span></div></footer>;
}
