import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '@/infrastructure/database/prismaClient';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [Credentials({
    credentials: { email: {}, password: {}, mfaCode: {} },
    authorize: async (credentials) => {
      const parsed = z.object({ email: z.string().email().max(254), password: z.string().min(8).max(72) }).safeParse(credentials);
      if (!parsed.success) return null;
      const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
      if (!user?.passwordHash || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return null;
      const mfaCode = typeof credentials.mfaCode === 'string' ? credentials.mfaCode : '';
      if (user.mfaEnabled && mfaCode !== (process.env.SIMULATED_MFA_CODE ?? '123456')) return null;
      return { id: user.id, name: user.name, email: user.email, role: user.role };
    }
  })],
  callbacks: {
    jwt: async ({ token, user }) => { if (user) token.role = (user as typeof user & { role?: string }).role; return token; },
    session: async ({ session, token }) => { if (session.user) { session.user.id = token.sub ?? ''; (session.user as typeof session.user & { role?: string }).role = String(token.role ?? 'USER'); } return session; }
  }
});
