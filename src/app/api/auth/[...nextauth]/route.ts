import { handlers } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, requestAddress } from '@/infrastructure/cache/redisClient';

export const GET = handlers.GET;
export async function POST(request: NextRequest) {
  if (request.url.includes('/callback/credentials') && !await rateLimit(`login:${requestAddress(request)}`, 10, 900)) {
    return NextResponse.json({ error: 'Demasiados intentos. Espera unos minutos y vuelve a probar.' }, { status: 429 });
  }
  return handlers.POST(request);
}
