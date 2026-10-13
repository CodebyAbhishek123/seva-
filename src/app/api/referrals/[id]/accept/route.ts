import { NextRequest, NextResponse } from "next/server";
import { MOCK_REFERRALS } from "@/lib/mock-data";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const ref = MOCK_REFERRALS.find((r) => r.id === id);

  if (!ref) {
    return NextResponse.json({ error: "Referral not found" }, { status: 404 });
  }

  const updated = {
    ...ref,
    status: "ACCEPTED",
    acceptedAt: new Date().toISOString(),
    acceptedBy: body.actorName || "Hospital Medical Officer",
    notes: body.notes,
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(updated);
}
