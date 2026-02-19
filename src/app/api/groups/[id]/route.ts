import { groups, groupMembers, GroupMember } from "@/lib/schema";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET /api/groups/[id] - Get group details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [group] = await db.select().from(groups).where(eq(groups.id, id));

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const members = await db
      .select()
      .from(groupMembers)
      .where(eq(groupMembers.groupId, id));

    return NextResponse.json({
      ...group,
      members: members.map((m: GroupMember) => ({
        id: m.id,
        displayName: m.displayName,
      })),
    });
  } catch (error) {
    console.error("Error fetching group:", error);
    return NextResponse.json({ error: "Failed to fetch group" }, { status: 500 });
  }
}

// DELETE /api/groups/[id] - Delete group
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

    const [group] = await db.select().from(groups).where(eq(groups.id, id));

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    if (group.creatorId !== session.user.id) {
      return NextResponse.json({ error: "Only creator can delete" }, { status: 403 });
    }

    await db.delete(groups).where(eq(groups.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting group:", error);
    return NextResponse.json({ error: "Failed to delete group" }, { status: 500 });
  }
}
