import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const payments = await prisma.payment.findMany({
      where: {
        bill: {
          connection: {
            userId: parseInt(session.user.id)
          }
        }
      },
      include: {
        bill: {
          select: {
            id: true,
            dueDate: true,
            connection: {
              select: {
                meterNo: true
              }
            }
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Error fetching payments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { billId } = body;

    if (!billId) {
      return NextResponse.json(
        { error: "Bill ID is required" },
        { status: 400 }
      );
    }

    // Verify the bill exists and belongs to the user
    const bill = await prisma.bill.findFirst({
      where: {
        id: billId,
        connection: {
          userId: parseInt(session.user.id)
        }
      }
    });

    if (!bill) {
      return NextResponse.json(
        { error: "Bill not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check if payment already exists
    const existingPayment = await prisma.payment.findFirst({
      where: {
        billId: billId
      }
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: "Payment already exists for this bill" },
        { status: 409 }
      );
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        billId: billId,
        amount: bill.amount,
        status: "PAID"
      }
    });

    return NextResponse.json(
      { message: "Payment successful", payment },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      { error: "Error processing payment" },
      { status: 500 }
    );
  }
} 