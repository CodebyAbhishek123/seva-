import { NextRequest, NextResponse } from "next/server";
import { MOCK_REFERRALS } from "@/lib/mock-data";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (!body.reason || body.reason.trim().length < 5) {
    return NextResponse.json(
      { error: "Mandatory clinical decline reason must be specified." },
      { status: 400 }
    );
  }

  const ref = MOCK_REFERRALS.find((r) => r.id === id);
  if (!ref) {
    return NextResponse.json({ error: "Referral not found" }, { status: 404 });
  }

  const updated = {
    ...ref,
    status: "DECLINED",
    declinedAt: new Date().toISOString(),
    declinedBy: body.actorName || "Medical Officer",
    declineReason: body.reason,
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(updated);
}
