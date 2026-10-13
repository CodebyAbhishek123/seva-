import { NextRequest, NextResponse } from "next/server";
import { MOCK_REFERRALS } from "@/lib/mock-data";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const referral = MOCK_REFERRALS.find((r) => r.id === id);

  if (!referral) {
    return NextResponse.json({ error: "Referral record not found" }, { status: 404 });
  }

  return NextResponse.json(referral);
}
