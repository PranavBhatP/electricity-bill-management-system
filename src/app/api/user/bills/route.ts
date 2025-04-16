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

    const bills = await prisma.bill.findMany({
      where: {
        connection: {
          userId: parseInt(session.user.id)
        }
      },
      include: {
        connection: {
          select: {
            meterNo: true,
            tariffType: true,
            tariffRate: true
          }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true
          }
        }
      },
      orderBy: {
        id: 'desc'
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