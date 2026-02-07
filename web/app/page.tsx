export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold text-white">📐</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  AI Construction Estimator
                </h1>
                <p className="text-xs text-slate-500">
                  Turn 3 days into 5 minutes
                </p>
              </div>
            </div>
            <nav className="flex items-center gap-6">
              <a href="#" className="text-sm text-slate-600 hover:text-slate-900">
                Features
              </a>
              <a href="#" className="text-sm text-slate-600 hover:text-slate-900">
                Pricing
              </a>
              <a href="/upload" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                Try Demo
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-slate-900 mb-6">
            Construction Estimating.
            <br />
            <span className="text-blue-600">Powered by AI.</span>
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Upload your drawings and specs. Get accurate estimates in minutes, not days.
            <br />
            Catch missing scope before it costs you money.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a href="/upload" className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-lg inline-block">
              Try Upload Demo
            </a>
            <button className="px-8 py-4 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-50 border border-slate-300">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              10x Faster
            </h3>
            <p className="text-slate-600">
              Generate detailed estimates in 5 minutes instead of 3 days. Focus on winning work, not data entry.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Catch Missing Scope
            </h3>
            <p className="text-slate-600">
              AI detects omissions automatically. No more costly variations from scope gaps.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Learn From History
            </h3>
            <p className="text-slate-600">
              Upload past jobs. AI learns your rates and gets more accurate with every estimate.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 bg-white rounded-2xl shadow-lg border border-slate-200 p-12">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">95%</div>
              <div className="text-slate-600">Time Saved</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">5 min</div>
              <div className="text-slate-600">Average Estimate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">±10%</div>
              <div className="text-slate-600">Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-slate-600">Always Available</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <h3 className="text-3xl font-bold text-slate-900 mb-4">
            Ready to transform your estimating process?
          </h3>
          <p className="text-lg text-slate-600 mb-6">
            Start with a free 14-day trial. No credit card required.
          </p>
          <button className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-lg">
            Get Started Now →
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-sm text-slate-500">
            <p>© 2026 AI Construction Estimator. Built for Australian construction.</p>
            <p className="mt-2">
              <span className="font-semibold">Status:</span> Day 2 - Upload Functionality 🚧
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
