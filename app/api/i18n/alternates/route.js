// app/api/i18n/alternates/route.ts
import { NextResponse } from "next/server";
import { resolveAlternates } from "@/app/lib/alternates";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const pathname = searchParams.get("pathname") || "/";
  const alternates = await resolveAlternates(pathname);
  return NextResponse.json({ alternates });
}
