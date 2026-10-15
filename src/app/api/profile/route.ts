import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import prisma from '@/infrastructure/database/prismaClient';

const profileSchema = z.object({ name: z.string().trim().min(2).max(80), shippingAddress: z.string().trim().min(8).max(240), phone: z.string().trim().max(30).optional(), taxId: z.string().trim().max(40).optional(), mfaEnabled: z.boolean().optional() });

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Inicia sesión.' }, { status: 401 });
  const parsed = profileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Revisa los datos del perfil.' }, { status: 400 });
  const { name, mfaEnabled, ...profile } = parsed.data;
  const result = await prisma.user.update({ where: { id: session.user.id }, data: { name, ...(mfaEnabled === undefined ? {} : { mfaEnabled }), profile: { upsert: { create: profile, update: profile } } }, include: { profile: true } });
  return NextResponse.json({ profile: result.profile });
}
