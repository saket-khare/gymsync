import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getGymConfig, getGymPasswordHash } from '@/lib/gym-config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        gymSlug: { label: 'Gym Slug', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const gymSlug = credentials?.gymSlug as string;
        const password = credentials?.password as string;

        if (!gymSlug || !password) return null;

        const [gymConfig, passwordHash] = await Promise.all([
          getGymConfig(gymSlug),
          getGymPasswordHash(gymSlug),
        ]);

        if (!gymConfig || !passwordHash) return null;
        if (!gymConfig.isActive) return null;

        const isValid = await bcrypt.compare(password, passwordHash);
        if (!isValid) return null;

        return {
          id: gymConfig.id,
          name: gymConfig.name,
          email: gymConfig.adminEmail,
          gymSlug: gymConfig.slug,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.gymSlug = (user as { gymSlug?: string }).gymSlug;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.gymSlug) {
        (session.user as { gymSlug?: string }).gymSlug = token.gymSlug as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
});
