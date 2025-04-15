import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Get user's complaints
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const complaints = await prisma.complaint.findMany({
      where: {
        userId: parseInt(session.user.id)
      },
      orderBy: {
        id: 'desc'
      }
    });

    return NextResponse.json(complaints);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return NextResponse.json(
      { error: "Error fetching complaints" },
      { status: 500 }
    );
  }
}

// Submit new complaint
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
    const { description } = body;

    if (!description) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    // Create new complaint
    const complaint = await prisma.complaint.create({
      data: {
        userId: parseInt(session.user.id),
        description,
        status: "pending" // Default status for new complaints
      }
    });

    return NextResponse.json(complaint, { status: 201 });
  } catch (error) {
    console.error("Error creating complaint:", error);
    return NextResponse.json(
      { error: "Error creating complaint" },
      { status: 500 }
    );
  }
} 