import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from '@/infrastructure/database/prismaClient';
import { registerSchema } from '@/modules/checkout/schemas';
import { rateLimit, requestAddress } from '@/infrastructure/cache/redisClient';

export async function POST(request: Request) {
  if (!await rateLimit(`register:${requestAddress(request)}`, 8, 900)) return NextResponse.json({ error: 'Demasiados intentos. Espera unos minutos y vuelve a probar.' }, { status: 429 });
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Revisa tus datos. La contraseña debe tener al menos 8 caracteres.' }, { status: 400 });
  try {
    const data = parsed.data;
    const user = await prisma.user.create({ data: { name: data.name, email: data.email.toLowerCase(), passwordHash: await bcrypt.hash(data.password, 12), profile: { create: {} } }, select: { id: true, email: true } });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return NextResponse.json({ error: 'Este correo ya está registrado.' }, { status: 409 });
    return NextResponse.json({ error: 'No se pudo crear la cuenta en este momento.' }, { status: 500 });
  }
}
