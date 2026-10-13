import { NextResponse } from "next/server";
import { MOCK_FACILITIES } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(MOCK_FACILITIES, {
    headers: {
      "X-MAIRA-Data-Provider": "Government-Healthcare-Operations-Gateway",
    },
  });
}
