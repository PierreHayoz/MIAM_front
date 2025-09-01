import { NextResponse } from "next/server";
const defaultLocale = "fr";
export function middleware(req) {
  const { pathname } = req.nextUrl;
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, req.url));
  }
  return NextResponse.next();
}
export const config = { matcher: ["/"] };