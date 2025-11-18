import { usersTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user || !user.primaryEmailAddress?.emailAddress || !user.fullName) {
      return NextResponse.json(
        { error: "Unauthorized or missing required user data." },
        { status: 401 }
      );
    }

    // ✅ Assign to constants after validation (TypeScript-safe)
    const name = user.fullName;
    const email = user.primaryEmailAddress.emailAddress;

    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (users.length === 0) {
      const result = await db
        .insert(usersTable)
        .values({
          name,  // ✅ Safe, guaranteed non-null
          email,
          credits: 10,
        })
        .returning({
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
          credits: usersTable.credits,
        });

      return NextResponse.json(result[0]);
    }

    // User already exists, return existing user
    return NextResponse.json(users[0]);
  } catch (error) {
    console.error("Error creating or finding user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
