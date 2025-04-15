import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Get all bills
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const bills = await prisma.bill.findMany({
      include: {
        connection: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
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

// Create new bill
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { connectionId, unitsConsumed, dueDate } = body;

    if (!connectionId || !unitsConsumed || !dueDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate units consumed
    if (unitsConsumed <= 0) {
      return NextResponse.json(
        { error: "Units consumed must be greater than 0" },
        { status: 400 }
      );
    }

    // Get connection details to calculate bill amount
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId }
    });

    if (!connection) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }

    // Calculate bill amount based on tariff rate and units consumed
    const amount = parseFloat(connection.tariffRate.toString()) * unitsConsumed;

    // Create consumption record
    const consumption = await prisma.consumption.create({
      data: {
        connId: connectionId,
        units: unitsConsumed,
        date: new Date()
      }
    });

    // Create bill
    const bill = await prisma.bill.create({
      data: {
        connId: connectionId,
        amount,
        dueDate: new Date(dueDate)
      },
      include: {
        connection: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(bill, { status: 201 });
  } catch (error) {
    console.error("Error creating bill:", error);
    return NextResponse.json(
      { error: "Error creating bill" },
      { status: 500 }
    );
  }
} 