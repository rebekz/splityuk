import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bills, billItems, participants, charges, users } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

interface BillParticipant {
  id: string;
  displayName: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  userImage: string | null;
}

// GET /api/bills/[id] - Get bill details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const participantId = request.headers.get("x-participant-id");

    const [bill] = await db.select().from(bills).where(eq(bills.id, id));
    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    // Get items
    const items = await db
      .select()
      .from(billItems)
      .where(eq(billItems.billId, id));

    // Get participants with user info
    const billParticipants: BillParticipant[] = await db
      .select({
        id: participants.id,
        displayName: participants.displayName,
        userId: participants.userId,
        userName: users.name,
        userEmail: users.email,
        userImage: users.image,
      })
      .from(participants)
      .leftJoin(users, eq(participants.userId, users.id))
      .where(eq(participants.billId, id));

    // Get charges
    const billCharges = await db
      .select()
      .from(charges)
      .where(eq(charges.billId, id));

    // Check if user can access
    const isCreator = session?.user?.id === bill.creatorId;
    const isParticipant = billParticipants.some(
      (p: BillParticipant) => p.id === participantId || p.userId === session?.user?.id
    );

    if (!isCreator && !isParticipant) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({
      bill,
      items,
      participants: billParticipants,
      charges: billCharges,
      isCreator,
      currentUserId: session?.user?.id,
      currentParticipantId: participantId,
    });
  } catch (error) {
    console.error("Error fetching bill:", error);
    return NextResponse.json({ error: "Failed to fetch bill" }, { status: 500 });
  }
}

// PUT /api/bills/[id] - Update bill
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

    const [bill] = await db.select().from(bills).where(eq(bills.id, id));
    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    if (bill.creatorId !== session.user.id) {
      return NextResponse.json({ error: "Only creator can update" }, { status: 403 });
    }

    const body = await request.json();
    const { name, date, status, notes } = body;

    const [updated] = await db
      .update(bills)
      .set({
        name: name ?? bill.name,
        date: date ? new Date(date) : bill.date,
        status: status ?? bill.status,
        updatedAt: new Date(),
      })
      .where(eq(bills.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating bill:", error);
    return NextResponse.json({ error: "Failed to update bill" }, { status: 500 });
  }
}

// DELETE /api/bills/[id] - Delete bill
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [bill] = await db.select().from(bills).where(eq(bills.id, id));
    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    if (bill.creatorId !== session.user.id) {
      return NextResponse.json({ error: "Only creator can delete" }, { status: 403 });
    }

    await db.delete(bills).where(eq(bills.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting bill:", error);
    return NextResponse.json({ error: "Failed to delete bill" }, { status: 500 });
  }
}
