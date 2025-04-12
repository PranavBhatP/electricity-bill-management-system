import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

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
    
    // Use raw SQL query to avoid any issues with model names
    const connections = await prisma.$queryRaw`
      SELECT 
        conn_id as id, 
        meter_no, 
        tariff_type, 
        tariff_rate::text
      FROM connections 
      WHERE user_id = ${userId}
    `;

    return NextResponse.json(connections);
  } catch (error) {
    console.error("Error fetching connections:", error);
    return NextResponse.json(
      { error: "Error fetching connections" },
      { status: 500 }
    );
  }
} 