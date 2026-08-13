import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/**
 * Next 16 sustituye middleware.ts por proxy.ts. El callback `authorized` de
 * auth.config decide qué rutas necesitan sesión.
 */
export const { auth: proxy } = NextAuth(authConfig);

export default proxy;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)"],
};
