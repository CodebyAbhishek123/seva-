import { NextRequest, NextResponse } from "next/server";
import { MOCK_REFERRALS, MOCK_AMBULANCES } from "@/lib/mock-data";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const ref = MOCK_REFERRALS.find((r) => r.id === id);
  const amb = MOCK_AMBULANCES.find((a) => a.id === body.ambulanceId);

  if (!ref || !amb) {
    return NextResponse.json(
      { error: "Invalid referral ID or ambulance ID" },
      { status: 404 }
    );
  }

  const updated = {
    ...ref,
    status: "AMBULANCE_ASSIGNED",
    assignedAmbulanceId: amb.id,
    ambulanceRegistration: amb.registrationNumber,
    ambulanceType: amb.type,
    driverName: amb.driverName,
    driverPhone: amb.driverPhone,
    tripStage: "EN_ROUTE_PICKUP",
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(updated);
}
