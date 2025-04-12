import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcrypt';
import { prisma } from "./prisma";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        role: { label: "Role", type: "select", options: ["user", "admin"] },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.role) {
          return null;
        }

        try {
          if (credentials.role === 'user') {
            const user = await prisma.user.findUnique({
              where: { email: credentials.email },
            });

            if (!user) return null;

            const passwordMatch = await bcrypt.compare(credentials.password, user.password);
            if (!passwordMatch) return null;

            return {
              id: String(user.id),
              email: user.email,
              name: user.name,
              role: 'user',
            };
          } else {
            const admin = await prisma.admin.findUnique({
              where: { email: credentials.email },
            });

            if (!admin) return null;

            const passwordMatch = await bcrypt.compare(credentials.password, admin.password);
            if (!passwordMatch) return null;

            return {
              id: String(admin.id),
              email: admin.email,
              name: admin.name,
              role: 'admin',
            };
          }
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 