import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    // Check if the user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // We need to use the userId field to match against session.user.id
    const userId = parseInt(session.user.id);
    
    // Use Prisma's standard query instead of raw SQL
    const connections = await prisma.connection.findMany({
      where: {
        userId: userId
      },
      select: {
        id: true,
        meterNo: true,
        tariffType: true,
        tariffRate: true
      }
    });

    return NextResponse.json(connections);
  } catch (error) {
    console.error("Error fetching connections:", error);
    return NextResponse.json(
      { error: "Error fetching connections" },
      { status: 500 }
    );
  }
} 