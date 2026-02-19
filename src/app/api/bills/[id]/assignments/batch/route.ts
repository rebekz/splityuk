import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { itemAssignments } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { eq, and, inArray } from "drizzle-orm";

// POST /api/bills/[id]/assignments/batch - Create multiple assignments (for equal split)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const participantId = request.headers.get("x-participant-id");

    if (!session?.user?.id && !participantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { itemId, assignments } = body;

    // Delete existing assignments for this item
    await db.delete(itemAssignments).where(eq(itemAssignments.itemId, itemId));

    // Insert new assignments
    const newAssignments = await db
      .insert(itemAssignments)
      .values(
        assignments.map((a: { participantId: string; amount: number }) => ({
          itemId,
          participantId: a.participantId,
          amount: a.amount.toString(),
        }))
      )
      .returning();

    return NextResponse.json(newAssignments, { status: 201 });
  } catch (error) {
    console.error("Error creating batch assignments:", error);
    return NextResponse.json({ error: "Failed to create assignments" }, { status: 500 });
  }
}
