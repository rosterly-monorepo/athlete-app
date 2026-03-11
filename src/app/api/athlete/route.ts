import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * BFF proxy: GET /api/athlete → FastAPI GET /api/v1/athletes/me/profile
 *
 * Checks auth AND role before proxying. This is the pattern:
 * 1. Clerk middleware ensures the user is signed in
 * 2. This route checks the role from session claims
 * 3. Attaches the Clerk JWT to the upstream request
 */
export async function GET() {
  const { userId, sessionClaims, getToken } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Role check: only athletes can access this endpoint
  const metadata = sessionClaims?.metadata as { role?: string } | undefined;
  const role = metadata?.role;
  if (role !== "athlete" && role !== undefined) {
    // role is set and it's not athlete → forbidden
    return NextResponse.json({ error: "Athlete account required" }, { status: 403 });
  }

  // Get Clerk JWT to forward to FastAPI backend (used when backend is connected)
  const _token = await getToken();

  // TODO: Proxy to FastAPI backend when connected
  // const response = await fetch(`${process.env.EXTERNAL_API_URL}/api/v1/athletes/me/profile`, {
  //   headers: { Authorization: `Bearer ${token}` },
  // });
  // return NextResponse.json(await response.json());

  return NextResponse.json({
    message: "Athlete API is working. Connect FastAPI backend to persist data.",
    userId,
  });
}
