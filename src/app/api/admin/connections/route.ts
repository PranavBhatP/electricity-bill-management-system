import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Get all connections
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const connections = await prisma.connection.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        id: 'desc'
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

export async function POST(request: Request) {
  try {
    // Check if the user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, meterNo, tariffType, tariffRate } = body;

    if (!userId || !meterNo || !tariffType || !tariffRate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate tariff rate is a positive number
    const rate = parseFloat(tariffRate);
    if (isNaN(rate) || rate <= 0) {
      return NextResponse.json(
        { error: "Tariff rate must be a positive number" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if meter number is already used
    const existingConnection = await prisma.connection.findUnique({
      where: { meterNo }
    });

    if (existingConnection) {
      return NextResponse.json(
        { error: "Meter number already in use" },
        { status: 409 }
      );
    }

    // Create new connection
    const connection = await prisma.connection.create({
      data: {
        userId: Number(userId),
        meterNo,
        tariffType,
        tariffRate: rate
      }
    });

    return NextResponse.json(
      { connection, message: "Connection created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating connection:", error);
    return NextResponse.json(
      { error: "Error creating connection" },
      { status: 500 }
    );
  }
} 