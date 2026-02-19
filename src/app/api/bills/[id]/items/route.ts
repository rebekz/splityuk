import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { billItems } from "@/lib/schema";
import { eq } from "drizzle-orm";

// GET /api/bills/[id]/items - Get all items for a bill
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const items = await db
      .select()
      .from(billItems)
      .where(eq(billItems.billId, id));

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

// POST /api/bills/[id]/items - Add new item
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();
    const { name, unitPrice, quantity } = body;

    const [newItem] = await db
      .insert(billItems)
      .values({
        billId: id,
        name: name || "Item",
        unitPrice: (unitPrice || 0).toString(),
        quantity: quantity || 1,
      })
      .returning();

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Error adding item:", error);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}

// PUT /api/bills/[id]/items - Update item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();
    const { itemId, name, unitPrice, quantity } = body;

    const [updated] = await db
      .update(billItems)
      .set({
        name: name,
        unitPrice: unitPrice?.toString(),
        quantity: quantity,
      })
      .where(eq(billItems.id, itemId))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

// DELETE /api/bills/[id]/items - Delete item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "itemId required" }, { status: 400 });
    }

    await db.delete(billItems).where(eq(billItems.id, itemId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
