import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bills, participants } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

// POST /api/bills/code/[code]/participants - Add guest participant
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { displayName } = body;

    if (!displayName) {
      return NextResponse.json({ error: "Display name required" }, { status: 400 });
    }

    // Find bill by share code
    const [bill] = await db.select().from(bills).where(eq(bills.shareCode, code));
    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    // Create participant
    const participantId = randomUUID();
    await db.insert(participants).values({
      id: participantId,
      billId: bill.id,
      userId: null, // Guest has no user ID
      displayName,
    });

    return NextResponse.json({ 
      participantId,
      displayName,
      billId: bill.id,
    }, { status: 201 });
  } catch (error) {
    console.error("Error adding participant:", error);
    return NextResponse.json({ error: "Failed to join bill" }, { status: 500 });
  }
}
