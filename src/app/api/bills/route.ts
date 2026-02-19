import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bills, participants } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { generateShareCode } from "@/lib/idr";

// GET /api/bills - List user's bills
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userBills = await db
      .select()
      .from(bills)
      .where(eq(bills.creatorId, session.user.id))
      .orderBy(bills.createdAt);

    return NextResponse.json(userBills);
  } catch (error) {
    console.error("Error fetching bills:", error);
    return NextResponse.json({ error: "Failed to fetch bills" }, { status: 500 });
  }
}

// POST /api/bills - Create new bill
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, date, notes } = body;

    const shareCode = generateShareCode();

    const [newBill] = await db
      .insert(bills)
      .values({
        name: name || "Tagihan Baru",
        date: date ? new Date(date) : new Date(),
        shareCode,
        creatorId: session.user.id,
        status: "active",
      })
      .returning();

    // Auto-add creator as participant
    await db.insert(participants).values({
      billId: newBill.id,
      userId: session.user.id,
      displayName: session.user.name || "Creator",
    });

    return NextResponse.json(newBill, { status: 201 });
  } catch (error) {
    console.error("Error creating bill:", error);
    return NextResponse.json({ error: "Failed to create bill" }, { status: 500 });
  }
}
