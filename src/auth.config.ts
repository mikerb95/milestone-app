import type { NextAuthConfig } from "next-auth";

/** Rutas accesibles sin sesión. */
const PUBLIC_ROUTES = ["/welcome", "/login", "/signup", "/forgot", "/reset"];

/**
 * Configuración sin adaptador ni bcrypt para que el middleware pueda correr
 * en el runtime edge. El archivo completo vive en src/auth.ts.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
    error: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isPublic = PUBLIC_ROUTES.some(
        (r) => pathname === r || pathname.startsWith(r + "/"),
      );

      if (isPublic) {
        /* Ya con sesión, las pantallas de acceso no tienen nada que ofrecer. */
        if (isLoggedIn) {
          return Response.redirect(new URL("/today", request.nextUrl));
        }
        return true;
      }

      if (!isLoggedIn) {
        return Response.redirect(new URL("/welcome", request.nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) session.user.id = token.id as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
