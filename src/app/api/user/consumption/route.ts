import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connectionId');

    if (!connectionId) {
      return NextResponse.json(
        { error: "Connection ID is required" },
        { status: 400 }
      );
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 1);

    const consumption = await prisma.consumption.findMany({
      where: {
        connId: parseInt(connectionId),
        date: {
          gte: sixMonthsAgo
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    const connection = await prisma.connection.findFirst({
      where: {
        id: parseInt(connectionId),
        user: {
          email: session.user.email as string
        }
      }
    });

    if (!connection) {
      return NextResponse.json(
        { error: "Connection not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(consumption);
  } catch (error) {
    console.error("Error fetching consumption:", error);
    return NextResponse.json(
      { error: "Error fetching consumption data" },
      { status: 500 }
    );
  }
} 