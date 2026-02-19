import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { participants, itemAssignments, billItems, paymentStatus, Participant, ItemAssignment, PaymentStatus } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

interface SettlementItem {
  participantId: string;
  participantName: string;
  total: number;
  isPaid: boolean;
  paidAt: Date | null;
}

// GET /api/bills/[id]/settlement - Get settlement summary
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get all items for this bill
    const items = await db
      .select()
      .from(billItems)
      .where(eq(billItems.billId, id));

    // Get all participants
    const billParticipants = await db
      .select()
      .from(participants)
      .where(eq(participants.billId, id));

    // Get all assignments
    const assignments = await db
      .select()
      .from(itemAssignments);

    // Get payment status
    const payments = await db
      .select()
      .from(paymentStatus);

    // Calculate totals per participant
    const settlement: SettlementItem[] = billParticipants.map((p: Participant) => {
      const participantAssignments: ItemAssignment[] = assignments.filter(
        (a: ItemAssignment) => a.participantId === p.id
      );
      
      const total = participantAssignments.reduce(
        (sum: number, a: ItemAssignment) => sum + parseFloat(a.amount),
        0
      );

      const payment = payments.find((pay: PaymentStatus) => pay.participantId === p.id);

      return {
        participantId: p.id,
        participantName: p.displayName,
        total,
        isPaid: payment?.isPaid ?? false,
        paidAt: payment?.paidAt ?? null,
      };
    });

    return NextResponse.json(settlement);
  } catch (error) {
    console.error("Error fetching settlement:", error);
    return NextResponse.json({ error: "Failed to fetch settlement" }, { status: 500 });
  }
}
