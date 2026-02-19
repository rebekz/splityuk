import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bills, participants, users } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { generateShareCode } from "@/lib/idr";
import { randomUUID } from "crypto";

// GET /api/bills - List user's bills
export async function GET() {
  try {
    const session = await auth();
    
    // For testing without auth, create/get a test user
    const testEmail = "test@splityuk.test";
    let testUser = await db.select().from(users).where(eq(users.email, testEmail)).limit(1);
    
    let userId: string;
    if (testUser.length > 0) {
      userId = testUser[0].id;
    } else {
      userId = randomUUID();
      await db.insert(users).values({
        id: userId,
        email: testEmail,
        name: "Test User",
      });
    }

    const userBills = await db
      .select()
      .from(bills)
      .where(eq(bills.creatorId, userId))
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
    
    // For testing without auth, create/get a test user
    const testEmail = "test@splityuk.test";
    let testUser = await db.select().from(users).where(eq(users.email, testEmail)).limit(1);
    
    let userId: string;
    if (testUser.length > 0) {
      userId = testUser[0].id;
    } else {
      userId = randomUUID();
      await db.insert(users).values({
        id: userId,
        email: testEmail,
        name: "Test User",
      });
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
        creatorId: userId,
        status: "active",
      })
      .returning();

    // Auto-add creator as participant
    await db.insert(participants).values({
      billId: newBill.id,
      userId: userId,
      displayName: "Test User",
    });

    return NextResponse.json(newBill, { status: 201 });
  } catch (error) {
    console.error("Error creating bill:", error);
    return NextResponse.json({ error: "Failed to create bill" }, { status: 500 });
  }
}
