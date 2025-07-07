import { usersTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user || !user.primaryEmailAddress?.emailAddress) {
      return NextResponse.json(
        { error: "Unauthorized or missing email." },
        { status: 401 }
      );
    }

    const email = user.primaryEmailAddress.emailAddress;

    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (users?.length == 0) {
      const result = await db
        .insert(usersTable)
        .values({
          name: user?.fullName,
          email: user?.primaryEmailAddress?.emailAddress,
          credits: 10,
        })
        .returning({ usersTable }); // Return the inserted user
      return NextResponse.json(result[0]?.usersTable);
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
