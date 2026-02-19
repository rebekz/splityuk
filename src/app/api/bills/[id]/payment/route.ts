import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { paymentInfo, paymentStatus, bills, participants } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

// GET /api/bills/[id]/payment - Get payment info
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [info] = await db
      .select()
      .from(paymentInfo)
      .where(eq(paymentInfo.billId, id));

    return NextResponse.json(info || null);
  } catch (error) {
    console.error("Error fetching payment info:", error);
    return NextResponse.json({ error: "Failed to fetch payment info" }, { status: 500 });
  }
}

// PUT /api/bills/[id]/payment - Update payment info
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is creator
    const [bill] = await db.select().from(bills).where(eq(bills.id, id));
    if (!bill || bill.creatorId !== session.user.id) {
      return NextResponse.json({ error: "Only creator can update" }, { status: 403 });
    }

    const body = await request.json();
    const { bankName, accountNumber, accountName } = body;

    // Check if payment info exists
    const [existing] = await db
      .select()
      .from(paymentInfo)
      .where(eq(paymentInfo.billId, id));

    let result;
    if (existing) {
      [result] = await db
        .update(paymentInfo)
        .set({ bankName, accountNumber, accountName })
        .where(eq(paymentInfo.billId, id))
        .returning();
    } else {
      [result] = await db
        .insert(paymentInfo)
        .values({ billId: id, bankName, accountNumber, accountName })
        .returning();
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating payment info:", error);
    return NextResponse.json({ error: "Failed to update payment info" }, { status: 500 });
  }
}

// PATCH /api/bills/[id]/payment - Toggle payment status for participant
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is creator
    const [bill] = await db.select().from(bills).where(eq(bills.id, id));
    if (!bill || bill.creatorId !== session.user.id) {
      return NextResponse.json({ error: "Only creator can mark payments" }, { status: 403 });
    }

    const body = await request.json();
    const { participantId, isPaid } = body;

    // Check if payment status exists
    const [existing] = await db
      .select()
      .from(paymentStatus)
      .where(eq(paymentStatus.participantId, participantId));

    let result;
    if (existing) {
      [result] = await db
        .update(paymentStatus)
        .set({
          isPaid,
          paidAt: isPaid ? new Date() : null,
        })
        .where(eq(paymentStatus.participantId, participantId))
        .returning();
    } else {
      [result] = await db
        .insert(paymentStatus)
        .values({
          participantId,
          isPaid,
          paidAt: isPaid ? new Date() : null,
        })
        .returning();
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating payment status:", error);
    return NextResponse.json({ error: "Failed to update payment status" }, { status: 500 });
  }
}
