import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Update quantity
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const quantity = await prisma.quantity.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({
      success: true,
      quantity,
    });
  } catch (error) {
    console.error('Update quantity error:', error);
    return NextResponse.json(
      { error: 'Failed to update quantity' },
      { status: 500 }
    );
  }
}

// Delete quantity
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.quantity.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Quantity deleted successfully',
    });
  } catch (error) {
    console.error('Delete quantity error:', error);
    return NextResponse.json(
      { error: 'Failed to delete quantity' },
      { status: 500 }
    );
  }
}
