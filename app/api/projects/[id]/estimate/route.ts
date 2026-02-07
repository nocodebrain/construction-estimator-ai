import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Generate estimate from quantities
 * Matches quantities to rates and creates line items
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = getPrisma();
    const { id: projectId } = await params;

    // Get project with quantities
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        quantities: {
          where: { verified: true }, // Only use verified quantities
          orderBy: { category: 'asc' },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.quantities.length === 0) {
      return NextResponse.json(
        { error: 'No verified quantities to estimate' },
        { status: 400 }
      );
    }

    // Get all active rates
    const rates = await prisma.rate.findMany({
      where: { active: true },
      orderBy: { category: 'asc' },
    });

    let created = 0;
    let totalLabor = 0;
    let totalMaterial = 0;

    // Match quantities to rates and create line items
    for (const quantity of project.quantities) {
      // Find matching rate (same category and unit)
      const matchingRate = rates.find(
        r => r.category === quantity.category && r.unit === quantity.unit
      );

      if (matchingRate) {
        const laborCost = quantity.amount * matchingRate.laborRate;
        const materialCost = quantity.amount * matchingRate.materialRate;
        const totalCost = quantity.amount * matchingRate.totalRate;

        await prisma.lineItem.create({
          data: {
            description: quantity.description,
            quantity: quantity.amount,
            unit: quantity.unit,
            laborRate: matchingRate.laborRate,
            materialRate: matchingRate.materialRate,
            totalRate: matchingRate.totalRate,
            laborCost,
            materialCost,
            totalCost,
            projectId,
            quantityId: quantity.id,
            rateId: matchingRate.id,
          },
        });

        totalLabor += laborCost;
        totalMaterial += materialCost;
        created++;

        // Update rate usage stats
        await prisma.rate.update({
          where: { id: matchingRate.id },
          data: {
            timesUsed: { increment: 1 },
            lastUsed: new Date(),
          },
        });
      }
    }

    // Calculate total with markup
    const markupPercent = project.markupPercent || 20;
    const subtotal = totalLabor + totalMaterial;
    const markup = subtotal * (markupPercent / 100);
    const totalCost = subtotal + markup;

    // Update project totals
    await prisma.project.update({
      where: { id: projectId },
      data: {
        laborCost: totalLabor,
        materialCost: totalMaterial,
        totalCost,
        status: 'READY',
      },
    });

    return NextResponse.json({
      success: true,
      stats: {
        lineItemsCreated: created,
        quantitiesMatched: created,
        quantitiesUnmatched: project.quantities.length - created,
        subtotal,
        markup,
        totalCost,
      },
    });
  } catch (error) {
    console.error('Generate estimate error:', error);

    if ((error as Error).message?.includes('Database not configured')) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate estimate' },
      { status: 500 }
    );
  }
}

/**
 * Get estimate summary (existing line items)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = getPrisma();
    const { id: projectId } = await params;

    const lineItems = await prisma.lineItem.findMany({
      where: { projectId },
      include: {
        rate: {
          select: { description: true, source: true },
        },
        quantity_data: {
          select: { source: true, confidence: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate totals
    const totalLabor = lineItems.reduce((sum, item) => sum + item.laborCost, 0);
    const totalMaterial = lineItems.reduce((sum, item) => sum + item.materialCost, 0);
    const totalCost = lineItems.reduce((sum, item) => sum + item.totalCost, 0);

    return NextResponse.json({
      success: true,
      lineItems,
      summary: {
        totalLabor,
        totalMaterial,
        subtotal: totalLabor + totalMaterial,
        totalCost,
        itemCount: lineItems.length,
      },
    });
  } catch (error) {
    console.error('Get estimate error:', error);

    if ((error as Error).message?.includes('Database not configured')) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to get estimate' },
      { status: 500 }
    );
  }
}
