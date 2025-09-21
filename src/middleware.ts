
import authConfig  from "@/auth.config"
import NextAuth from "next-auth";
import {DEFAULT_LOGIN_REDIRECT, apiAuthPrefix, authRoutes, publicRoutes } from "@/route"
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);

  const isPublicRoute = publicRoutes.some(route => {
    if (route.includes('[id]')) {
      // Match dynamic routes (e.g., "/blog/[id]")
      const regex = new RegExp(route.replace('[id]', '\\w+'));
      return regex.test(nextUrl.pathname);
    } else {
      // Match static routes
      return route === nextUrl.pathname;
    }
  });
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
 
  if (isApiAuthRoute) {
    return ;
  }
  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }

    return ;
  }
  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    return Response.redirect(new URL( 
     `/auth/login?callbackUrl=${encodedCallbackUrl}`,
     nextUrl
     ));
  }

  console.log('nextUrl.pathname:', nextUrl.pathname);
  console.log('isPublicRoute:', isPublicRoute);
  

  return ;
}) 

// Optionally, don't invoke Middleware on some paths
// Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
    runtime: "nodejs",
  }

   