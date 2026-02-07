import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { getR2PresignedUrl } from '@/lib/r2';
import { extractPDFText, extractQuantitiesFromText, categorizeQuantity } from '@/lib/pdf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for processing

/**
 * Process a file - extract text, detect quantities
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: fileId } = await params;

    // Get file from database
    const file = await getPrisma().file.findUnique({
      where: { id: fileId },
      include: { project: true },
    });

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Only process PDFs for now
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files can be processed currently' },
        { status: 400 }
      );
    }

    // Download file from R2
    const downloadUrl = await getR2PresignedUrl(file.key);
    const response = await fetch(downloadUrl);

    if (!response.ok) {
      throw new Error('Failed to download file from storage');
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from PDF
    const extractedText = await extractPDFText(buffer);

    // Extract quantities from text
    const detectedQuantities = extractQuantitiesFromText(extractedText);

    // Save extracted text to file record
    await getPrisma().file.update({
      where: { id: fileId },
      data: {
        processed: true,
        extractedText,
      },
    });

    // Save detected quantities to database
    const createdQuantities = await Promise.all(
      detectedQuantities.map(q =>
        getPrisma().quantity.create({
          data: {
            description: q.description.substring(0, 255), // Limit length
            unit: q.unit,
            amount: q.amount,
            category: categorizeQuantity(q.description) as any,
            confidence: q.confidence,
            source: `${file.name}`,
            verified: false,
            projectId: file.projectId,
            fileId: file.id,
          },
        })
      )
    );

    // Update project status to READY if it was PROCESSING
    if (file.project.status === 'PROCESSING') {
      await getPrisma().project.update({
        where: { id: file.projectId },
        data: { status: 'READY' },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${file.name}`,
      stats: {
        textLength: extractedText.length,
        quantitiesFound: createdQuantities.length,
      },
      quantities: createdQuantities,
    });
  } catch (error) {
    console.error('File processing error:', error);
    return NextResponse.json(
      { error: 'Processing failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}
