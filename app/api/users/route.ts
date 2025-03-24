import { getBatchUserInfo } from "@/lib/clerk";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userIds } = await request.json();

    if (!userIds || !Array.isArray(userIds)) {
      return NextResponse.json(
        { error: "User IDs must be provided as an array" },
        { status: 400 }
      );
    }

    const users = await getBatchUserInfo(userIds);

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch user information" },
      { status: 500 }
    );
  }
}
