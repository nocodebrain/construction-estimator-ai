import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'construction-estimator-web',
    timestamp: new Date().toISOString(),
  });
}
