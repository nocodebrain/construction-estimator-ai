import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    checks: {
      database: false,
      storage: false,
    },
    missing: [] as string[],
  };

  // Check database
  if (!process.env.DATABASE_URL) {
    health.status = 'degraded';
    health.missing.push('DATABASE_URL');
  } else {
    health.checks.database = true;
  }

  // Check R2 storage
  const r2Vars = ['R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME', 'R2_ENDPOINT'];
  const missingR2 = r2Vars.filter(v => !process.env[v]);
  
  if (missingR2.length > 0) {
    health.status = 'degraded';
    health.missing.push(...missingR2);
  } else {
    health.checks.storage = true;
  }

  return NextResponse.json(health, {
    status: health.status === 'ok' ? 200 : 503,
  });
}
