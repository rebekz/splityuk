import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { itemAssignments, billItems } from "@/lib/schema";
import { eq, inArray } from "drizzle-orm";

// GET /api/bills/[id]/assignments - Get all assignments for a bill
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get all item IDs for this bill
    const items = await db
      .select({ id: billItems.id })
      .from(billItems)
      .where(eq(billItems.billId, id));

    const itemIds = items.map((i: { id: string }) => i.id);

    if (itemIds.length === 0) {
      return NextResponse.json([]);
    }

    // Get all assignments for these items
    const assignments = await db
      .select()
      .from(itemAssignments)
      .where(inArray(itemAssignments.itemId, itemIds));

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
  }
}

// POST /api/bills/[id]/assignments - Create assignment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();
    const { itemId, participantId, amount } = body;

    const [assignment] = await db
      .insert(itemAssignments)
      .values({
        itemId,
        participantId,
        amount: (amount || 0).toString(),
      })
      .returning();

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 });
  }
}

// DELETE /api/bills/[id]/assignments - Remove assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");
    const targetParticipantId = searchParams.get("participantId");

    if (!itemId || !targetParticipantId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    await db.delete(itemAssignments)
      .where(eq(itemAssignments.itemId, itemId))
      .where(eq(itemAssignments.participantId, targetParticipantId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json({ error: "Failed to delete assignment" }, { status: 500 });
  }
}
