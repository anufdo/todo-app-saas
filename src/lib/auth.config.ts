import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "./db";
import { compare } from "bcryptjs";

export const authConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          throw new Error("User not found");
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add user id to the token on sign in
      if (user) {
        token.id = user.id;
        
        // Fetch user's memberships to get role and tenant info
        const memberships = await db.membership.findMany({
          where: { userId: user.id },
          include: { tenant: true },
          orderBy: [
            { role: 'asc' }, // owner < admin < member
            { createdAt: 'asc' }
          ]
        });
        
        // Get the highest role (owner > admin > member)
        const roleOrder = { owner: 1, admin: 2, member: 3 };
        const primaryMembership = memberships.sort((a, b) => 
          roleOrder[a.role] - roleOrder[b.role]
        )[0];
        
        token.role = primaryMembership?.role || 'member';
        token.tenantId = primaryMembership?.tenantId;
        token.subdomain = primaryMembership?.tenant.subdomain;
        token.hasTenant = memberships.length > 0;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user id, role, and tenant info to the session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.tenantId = token.tenantId as string;
        session.user.subdomain = token.subdomain as string;
        session.user.hasTenant = token.hasTenant as boolean;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAuth = nextUrl.pathname.startsWith("/auth");
      const isOnApp = nextUrl.pathname.startsWith("/app");
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");

      if (isOnAuth) {
        return !isLoggedIn;
      }

      if (isOnApp || isOnAdmin) {
        return isLoggedIn;
      }

      return true;
    },
  },
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
} satisfies NextAuthConfig;
