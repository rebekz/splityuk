import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // TEMPORARILY DISABLED FOR TESTING
  // TODO: Re-enable auth after configuring Google OAuth / Magic Link
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
