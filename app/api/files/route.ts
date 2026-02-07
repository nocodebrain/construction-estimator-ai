import { NextResponse } from 'next/server';
import { listR2Files } from '@/lib/r2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const files = await listR2Files('uploads/');

    // Transform S3 objects to simple file metadata
    const fileList = files.map((file) => ({
      key: file.Key || '',
      size: file.Size || 0,
      lastModified: file.LastModified?.toISOString() || '',
      name: file.Key?.split('/').pop() || 'unknown',
    }));

    return NextResponse.json({
      success: true,
      files: fileList,
    });
  } catch (error) {
    console.error('List files error:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
}
