'use client';

import { SessionProvider } from 'next-auth/react';
import { FavoritesProvider } from '@/components/shared/FavoritesProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <SessionProvider><FavoritesProvider>{children}</FavoritesProvider></SessionProvider>;
}
