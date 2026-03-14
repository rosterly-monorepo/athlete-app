import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId, sessionClaims, orgId, orgRole } = await auth();

  return NextResponse.json({
    userId,
    orgId,
    orgRole,
    sessionClaims,
  });
}
