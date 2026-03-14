import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * BFF proxy: GET /api/athlete → FastAPI GET /api/v1/athletes/me/profile
 *
 * Checks auth AND role before proxying:
 * 1. Clerk middleware ensures the user is signed in
 * 2. This route checks org claims — coaches (active org) are blocked
 * 3. Attaches the Clerk JWT to the upstream request
 */
export async function GET() {
  const { userId, orgId, getToken } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Role check: coaches (users with an active org) can't access athlete endpoints
  if (orgId) {
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
