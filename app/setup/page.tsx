'use client';

import { useState, useEffect } from 'react';

interface HealthCheck {
  status: string;
  checks: {
    database: boolean;
    storage: boolean;
  };
  missing: string[];
}

export default function SetupPage() {
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealth(data);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Checking system status...</p>
      </div>
    );
  }

  const allGood = health?.status === 'ok';

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-white">📐</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                AI Construction Estimator
              </h1>
              <p className="text-xs text-slate-500">Setup & Configuration</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                allGood ? 'bg-green-100' : 'bg-yellow-100'
              }`}>
                <span className="text-3xl">{allGood ? '✅' : '⚠️'}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {allGood ? 'System Ready!' : 'Setup Required'}
                </h2>
                <p className="text-slate-600">
                  {allGood 
                    ? 'All systems operational'
                    : 'Some environment variables are missing'}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {/* Database Check */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {health?.checks.database ? '✅' : '❌'}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">Database (PostgreSQL)</p>
                    <p className="text-sm text-slate-600">
                      {health?.checks.database 
                        ? 'Connected and ready'
                        : 'DATABASE_URL not configured'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Storage Check */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {health?.checks.storage ? '✅' : '❌'}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">File Storage (R2)</p>
                    <p className="text-sm text-slate-600">
                      {health?.checks.storage 
                        ? 'Configured and ready'
                        : 'R2 credentials not configured'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {!allGood && health?.missing && health.missing.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-slate-900 mb-3">Missing Variables:</h3>
                <div className="space-y-2">
                  {health.missing.map((variable) => (
                    <div key={variable} className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-white border border-yellow-300 rounded font-mono text-sm">
                        {variable}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-3">Quick Setup Guide:</h3>
              
              <div className="space-y-4 text-sm text-slate-700">
                <div>
                  <p className="font-semibold mb-1">1. Add PostgreSQL Database:</p>
                  <p className="text-slate-600 ml-4">
                    Railway Dashboard → + New → Database → PostgreSQL
                  </p>
                  <p className="text-slate-600 ml-4">
                    (Automatically adds DATABASE_URL)
                  </p>
                </div>

                <div>
                  <p className="font-semibold mb-1">2. Run Database Migrations:</p>
                  <p className="text-slate-600 ml-4">
                    Settings → Run one-off → Command:
                  </p>
                  <pre className="ml-4 mt-1 p-2 bg-white border border-slate-200 rounded text-xs overflow-x-auto">
npx prisma db push && npm run db:seed
                  </pre>
                </div>

                <div>
                  <p className="font-semibold mb-1">3. Add R2 Storage (Optional - for file uploads):</p>
                  <p className="text-slate-600 ml-4">
                    See SETUP-RAILWAY.md in the repository for full R2 setup guide
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={checkHealth}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
              >
                ↻ Recheck Status
              </button>
              {allGood && (
                <a
                  href="/projects"
                  className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
                >
                  → Go to Projects
                </a>
              )}
            </div>
          </div>

          {/* Documentation Links */}
          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <a
              href="https://github.com/nocodebrain/construction-estimator-ai/blob/master/SETUP-RAILWAY.md"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
            >
              <p className="font-semibold text-slate-900 mb-1">📖 Setup Guide</p>
              <p className="text-sm text-slate-600">Complete Railway setup instructions</p>
            </a>
            <a
              href="https://github.com/nocodebrain/construction-estimator-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
            >
              <p className="font-semibold text-slate-900 mb-1">💻 GitHub Repo</p>
              <p className="text-sm text-slate-600">View source code and documentation</p>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
