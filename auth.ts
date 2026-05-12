import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import sql from '@/lib/db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        correo: { label: 'Correo', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.correo || !credentials?.password) return null;

          console.log('🔍 Buscando usuario:', credentials.correo);

          const rows = await sql`
            SELECT id, nombre_completo, correo, password_hash, rol, activo
            FROM sistema_tg.usuarios
            WHERE correo = ${credentials.correo as string}
            LIMIT 1
          `;

          console.log('📦 Resultado DB:', rows);

          const user = rows[0];
          if (!user || !user.activo) {
            console.log('❌ Usuario no encontrado o inactivo');
            return null;
          }

          const passwordMatch = await bcrypt.compare(
            credentials.password as string,
            user.password_hash
          );

          console.log('🔐 Password match:', passwordMatch);

          if (!passwordMatch) return null;

          return {
            id: String(user.id),
            name: user.nombre_completo,
            email: user.correo,
            role: user.rol,
          };
        } catch (error) {
          console.error('💥 Error en authorize:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = token.role;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
});