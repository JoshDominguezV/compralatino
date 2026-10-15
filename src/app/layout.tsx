import type { Metadata } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/shared/SiteHeader';
import { SiteFooter } from '@/components/shared/SiteFooter';
import { AppProviders } from '@/components/shared/AppProviders';

export const metadata: Metadata = {
  title: 'CompraLatino — Japón, más cerca de ti',
  description: 'Encuentra piezas únicas, tecnología y coleccionables en Japón. Nosotros compramos por ti y lo llevamos a Latinoamérica.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body><AppProviders><div className="site-shell"><SiteHeader />{children}<SiteFooter /></div></AppProviders></body></html>;
}
