'use client';

import Link from 'next/link';
import { Search, UserRound, Heart, Menu, X, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useFavorites } from '@/components/shared/FavoritesProvider';

export function SiteHeader() {
  const { data: session } = useSession();
  const { favorites, ready } = useFavorites();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  useEffect(() => { setQuery(new URLSearchParams(window.location.search).get('q') ?? ''); }, []);
  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.location.href = query.trim() ? `/?q=${encodeURIComponent(query.trim())}#catalogo` : '/#catalogo';
    setSearchOpen(false);
  }
  return <>
    <div className="announcement"><span className="announcement-main">CompraLatino <i>·</i> Japón, más cerca de ti</span><span className="announcement-demo"><span className="live-dot" /> Modo demostración: pagos y pujas simulados</span></div>
    <header className="site-header"><div className={`header-inner ${searchOpen ? 'search-open' : ''}`}>
      <button className="mobile-menu-button" aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={19} /> : <Menu size={20} />}</button>
      <Link href="/" className="brand"><span className="brand-mark">C</span><span className="brand-name">compra<em>latino</em></span></Link>
      <nav className="main-nav" aria-label="Navegación principal"><a href="/#catalogo">Explorar</a><a href="/?tipo=auction#catalogo">Subastas</a><a href="/#como-funciona">Cómo funciona</a></nav>
      <form id="header-search-form" className="header-search" role="search" onSubmit={submitSearch}><Search size={16} /><input type="search" aria-label="Buscar artículos" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar artículos japoneses" /></form>
      <div className="header-actions"><button className="icon-link" aria-label="Buscar" aria-controls="header-search-form" aria-expanded={searchOpen} onClick={() => setSearchOpen(!searchOpen)}><Search size={18} /></button><Link className="icon-link" href={session ? '/profile' : '/login'} aria-label={session ? 'Mi perfil' : 'Iniciar sesión'}><UserRound size={18} /></Link><Link className="icon-link favorite-nav" href="/favorites" aria-label={ready ? `Favoritos, ${favorites.length} guardados` : 'Favoritos'}><Heart size={18} />{ready && favorites.length > 0 && <span className="favorite-count">{favorites.length}</span>}</Link>{session ? <><Link className="header-link" href="/bids">Mis pujas</Link><Link className="header-link" href="/orders">Mis compras</Link><button className="header-link logout-link" onClick={() => signOut({ callbackUrl: '/' })}><LogOut size={14} /> Salir</button></> : <Link className="header-link" href="/login">Iniciar sesión</Link>}</div>
    </div>{menuOpen && <nav id="mobile-nav" className="mobile-nav" aria-label="Navegación móvil"><a href="/#catalogo" onClick={() => setMenuOpen(false)}>Explorar artículos</a><a href="/?tipo=auction#catalogo" onClick={() => setMenuOpen(false)}>Subastas activas</a><a href="/#como-funciona" onClick={() => setMenuOpen(false)}>Cómo funciona</a><Link href="/favorites" onClick={() => setMenuOpen(false)}>Favoritos ({ready ? favorites.length : '…'})</Link>{session ? <><Link href="/bids" onClick={() => setMenuOpen(false)}>Mis pujas</Link><Link href="/orders" onClick={() => setMenuOpen(false)}>Mis compras</Link><button onClick={() => signOut({ callbackUrl: '/' })}>Cerrar sesión</button></> : <Link href="/login" onClick={() => setMenuOpen(false)}>Iniciar sesión</Link>}</nav>}</header>
  </>;
}
