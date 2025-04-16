import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = parseInt(params.id);

    // Get all connections for this user
    const connections = await prisma.connection.findMany({
      where: { userId },
      select: { id: true }
    });

    const connectionIds = connections.map(conn => conn.id);

    // Delete in order to maintain referential integrity
    // 1. Delete all payments and invoices
    await prisma.$transaction(async (prisma) => {
      // Delete invoices first (they reference payments)
      await prisma.invoice.deleteMany({
        where: {
          payment: {
            bill: {
              connId: {
                in: connectionIds
              }
            }
          }
        }
      });

      // Delete payments
      await prisma.payment.deleteMany({
        where: {
          bill: {
            connId: {
              in: connectionIds
            }
          }
        }
      });

      // Delete consumption records
      await prisma.consumption.deleteMany({
        where: {
          connId: {
            in: connectionIds
          }
        }
      });

      // Delete bills
      await prisma.bill.deleteMany({
        where: {
          connId: {
            in: connectionIds
          }
        }
      });

      // Delete complaints
      await prisma.complaint.deleteMany({
        where: {
          userId
        }
      });

      // Delete connections
      await prisma.connection.deleteMany({
        where: {
          userId
        }
      });

      // Finally, delete the user
      await prisma.user.delete({
        where: {
          id: userId
        }
      });
    });

    return NextResponse.json(
      { message: "User and associated data deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Error deleting user" },
      { status: 500 }
    );
  }
} 