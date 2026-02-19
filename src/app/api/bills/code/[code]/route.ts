import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bills, billItems, participants, users } from "@/lib/schema";
import { eq } from "drizzle-orm";

// GET /api/bills/code/[code] - Get bill by share code (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const [bill] = await db.select().from(bills).where(eq(bills.shareCode, code));
    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    // Get items
    const items = await db
      .select()
      .from(billItems)
      .where(eq(billItems.billId, bill.id));

    // Get participants
    const billParticipants = await db
      .select({
        id: participants.id,
        displayName: participants.displayName,
        userId: participants.userId,
      })
      .from(participants)
      .where(eq(participants.billId, bill.id));

    // Calculate total
    const totalAmount = items.reduce((sum, item) => {
      return sum + (parseFloat(item.unitPrice) * item.quantity);
    }, 0);

    return NextResponse.json({
      id: bill.id,
      code: bill.shareCode,
      title: bill.name,
      totalAmount,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: parseFloat(item.unitPrice),
        quantity: item.quantity,
      })),
      participants: billParticipants,
    });
  } catch (error) {
    console.error("Error fetching bill by code:", error);
    return NextResponse.json({ error: "Failed to fetch bill" }, { status: 500 });
  }
}
