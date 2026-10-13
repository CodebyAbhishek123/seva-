import { NextResponse } from "next/server";
import { MOCK_AMBULANCES } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(MOCK_AMBULANCES, {
    headers: {
      "X-MAIRA-Data-Provider": "108-Emergency-Medical-Telematics-Gateway",
    },
  });
}
