import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  return NextResponse.json({
    tripId: id,
    eventStage: body.eventStage,
    status: "RECORDED",
    timestamp: new Date().toISOString(),
  });
}
