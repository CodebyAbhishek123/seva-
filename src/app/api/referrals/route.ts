import { NextRequest, NextResponse } from "next/server";
import { MOCK_REFERRALS } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");

  let list = MOCK_REFERRALS;
  if (status && status !== "ALL") {
    list = list.filter((r) => r.status === status);
  }

  return NextResponse.json(list, {
    headers: {
      "X-MAIRA-Data-Provider": "Government-Healthcare-Operations-Gateway",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newReferral = {
      id: `REF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json(newReferral, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }
}
