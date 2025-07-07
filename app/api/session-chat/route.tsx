import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { currentUser } from "@clerk/nextjs/server";
import { SessionChatTable } from "@/config/schema";
import { db } from "@/config/db";
import { eq, desc } from "drizzle-orm";

// ✅ POST: Create a new chat session
export async function POST(req: NextRequest) {
  const { notes, selectedDoctor, conversation, report} = await req.json();
  const user = await currentUser();

  if (!user || !user.primaryEmailAddress?.emailAddress) {
    return NextResponse.json(
      { error: "Unauthorized. User not found." },
      { status: 401 }
    );
  }

  try {
    const sessionId = uuidv4();

    const result = await db
      .insert(SessionChatTable)
      .values({
        sessionId,
        createdBy: user.primaryEmailAddress.emailAddress,
        notes,
        selectedDoctor:selectedDoctor,
        conversation: conversation || null,  // Optional JSON fields
        report: report || null,
        voiceId: selectedDoctor.voiceId || null,
        // ✅ No need for c.reatedOn as defaultNow() auto-fills it
      })
      .returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Failed to create session." },
      { status: 500 }
    );
  }
}

// ✅ GET: Fetch session details by sessionId or all sessions
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const user = await currentUser();

  if (!user || !user.primaryEmailAddress?.emailAddress) {
    return NextResponse.json(
      { error: "Unauthorized. User not found." },
      { status: 401 }
    );
  }

  if (!sessionId) {
    return NextResponse.json(
      { error: "Session ID is required." },
      { status: 400 }
    );
  }

  try {
    if (sessionId === "all") {
      const result = await db
        .select()
        .from(SessionChatTable)
        .where(eq(SessionChatTable.createdBy, user.primaryEmailAddress.emailAddress))
        .orderBy(desc(SessionChatTable.id));

      return NextResponse.json(result);
    }

    const result = await db
      .select()
      .from(SessionChatTable)
      .where(eq(SessionChatTable.sessionId, sessionId));

    if (result.length === 0) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session." },
      { status: 500 }
    );
  }
}
