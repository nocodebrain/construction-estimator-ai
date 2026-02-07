import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Get all quantities for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    const quantities = await prisma.quantity.findMany({
      where: { projectId },
      include: {
        file: {
          select: { name: true },
        },
      },
      orderBy: [
        { category: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      quantities,
    });
  } catch (error) {
    console.error('Get quantities error:', error);
    return NextResponse.json(
      { error: 'Failed to get quantities' },
      { status: 500 }
    );
  }
}

// Create manual quantity
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();

    const { description, unit, amount, category } = body;

    if (!description || !unit || !amount || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const quantity = await prisma.quantity.create({
      data: {
        description,
        unit,
        amount: parseFloat(amount),
        category,
        confidence: 1.0, // Manual entry = 100% confidence
        source: 'Manual entry',
        verified: true,
        projectId,
      },
    });

    return NextResponse.json({
      success: true,
      quantity,
    });
  } catch (error) {
    console.error('Create quantity error:', error);
    return NextResponse.json(
      { error: 'Failed to create quantity' },
      { status: 500 }
    );
  }
}
