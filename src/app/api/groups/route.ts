import { groups, groupMembers, Group, GroupMember } from "@/lib/schema";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET /api/groups - List user's groups
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userGroups = await db
      .select()
      .from(groups)
      .where(eq(groups.creatorId, session.user.id));

    // Get members for each group
    const groupsWithMembers = await Promise.all(
      userGroups.map(async (group: Group) => {
        const members = await db
          .select()
          .from(groupMembers)
          .where(eq(groupMembers.groupId, group.id));

        return {
          ...group,
          members: members.map((m: GroupMember) => ({
            id: m.id,
            displayName: m.displayName,
          })),
        };
      })
    );

    return NextResponse.json(groupsWithMembers);
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 });
  }
}

// POST /api/groups - Create new group
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, members } = body;

    const [newGroup] = await db
      .insert(groups)
      .values({
        name,
        creatorId: session.user.id,
      })
      .returning();

    // Add members
    if (members && members.length > 0) {
      await db.insert(groupMembers).values(
        members.map((displayName: string) => ({
          groupId: newGroup.id,
          displayName,
        }))
      );
    }

    return NextResponse.json(newGroup, { status: 201 });
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
  }
}
