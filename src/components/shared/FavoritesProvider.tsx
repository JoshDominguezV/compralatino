'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type FavoritesContextValue = { favorites: string[]; ready: boolean; toggleFavorite: (id: string) => void; isFavorite: (id: string) => boolean };
const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem('compralatino:favorites') ?? '[]');
      setFavorites(Array.isArray(stored) ? stored.filter((item): item is string => typeof item === 'string') : []);
    }
    catch { setFavorites([]); }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem('compralatino:favorites', JSON.stringify(favorites)); } catch { return; }
  }, [favorites, ready]);
  const toggleFavorite = (id: string) => setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  return <FavoritesContext.Provider value={{ favorites, ready, toggleFavorite, isFavorite: (id) => favorites.includes(id) }}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites debe usarse dentro de FavoritesProvider');
  return context;
}
