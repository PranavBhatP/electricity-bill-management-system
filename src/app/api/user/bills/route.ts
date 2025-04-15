import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Get user's bills
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's connections first
    const connections = await prisma.connection.findMany({
      where: {
        userId: parseInt(session.user.id)
      },
      select: {
        id: true
      }
    });

    const connectionIds = connections.map(conn => conn.id);

    // Get bills for all user's connections
    const bills = await prisma.bill.findMany({
      where: {
        connId: {
          in: connectionIds
        }
      },
      include: {
        connection: true,
        payments: {
          select: {
            id: true,
            amount: true,
            status: true
          }
        }
      },
      orderBy: {
        dueDate: 'desc'
      }
    });

    return NextResponse.json(bills);
  } catch (error) {
    console.error("Error fetching bills:", error);
    return NextResponse.json(
      { error: "Error fetching bills" },
      { status: 500 }
    );
  }
} 