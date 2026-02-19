import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bills } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

// PUT /api/bills/[id]/lock - Lock/unlock a bill
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

    // Only creator can lock/unlock
    if (bill.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: "Only creator can lock bill" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { locked } = body;

    const [updated] = await db
      .update(bills)
      .set({
        status: locked ? "settled" : "active",
        updatedAt: new Date(),
      })
      .where(eq(bills.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error locking bill:", error);
    return NextResponse.json({ error: "Failed to lock bill" }, { status: 500 });
  }
}
