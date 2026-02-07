# AI Construction Estimator

**Transform construction estimating from days to minutes using AI**

## 🎯 What Is This?

An intelligent platform that:
- Reads construction drawings and specifications
- Automatically extracts quantities
- Applies learned rates from historical jobs
- Generates accurate cost estimates
- Detects missing scope to de-risk quotes

**Target:** Australian construction companies (fit-outs, renovations, new builds)

**Timeline:** 4 weeks to MVP (Feb 7 - Mar 7, 2026)

---

## 📚 Documentation

- **[PRODUCT-VISION.md](./PRODUCT-VISION.md)** - Market opportunity, features, business model
- **[TECHNICAL-ARCHITECTURE.md](./TECHNICAL-ARCHITECTURE.md)** - Stack, data models, AI pipeline
- **[4-WEEK-SPRINT-PLAN.md](./4-WEEK-SPRINT-PLAN.md)** - Day-by-day build plan

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 16
- Docker (optional, for AI service)

### Setup (Day 1)

```bash
# Clone repo
git clone <repo-url>
cd construction-estimator-ai

# Install frontend dependencies
npm install

# Set up database
npx prisma migrate dev

# Run development server
npm run dev

# In another terminal, start AI service
cd ai-service
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

Open http://localhost:3000

---

## 🏗️ Tech Stack

**Frontend:**
- Next.js 16 (React 19, App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Prisma (ORM)

**AI Services:**
- Python 3.11 + FastAPI
- YOLOv8 (drawing analysis)
- GPT-4 API (scope analysis, missing scope detection)
- PyMuPDF (PDF parsing)
- Tesseract (OCR)

**Infrastructure:**
- Railway (hosting)
- PostgreSQL (database)
- Cloudflare R2 (file storage)

---

## 💡 Core Features

### Phase 1 (Week 1): Document Processing
- Upload drawings, specs, scope docs
- Parse PDFs for text and tables
- Drawing viewer with manual measurement

### Phase 2 (Week 2): AI Quantity Takeoff
- Detect walls, doors, windows, rooms (computer vision)
- Extract dimensions from text
- Calculate areas, lengths, counts
- Manual correction interface

### Phase 3 (Week 3): Smart Estimation
- Rate library (industry rates + learned rates)
- Apply rates to quantities
- Upload historical jobs to improve accuracy
- Missing scope detection (AI-powered)

### Phase 4 (Week 4): Production Ready
- Export estimates (PDF, Excel, CSV)
- Multi-user accounts with permissions
- Mobile-responsive UI
- Beta customer launch

---

## 🎯 Business Model

**Pricing:**
- **Starter:** $299/month (10 estimates)
- **Professional:** $799/month (50 estimates, custom rates, missing scope detection)
- **Enterprise:** $2,500+/month (unlimited, API, white-label)

**Revenue Goal:**
- 100 customers @ $799/month = **$958k ARR**

---

## 📈 Roadmap

**Weeks 1-4:** MVP (see [4-WEEK-SPRINT-PLAN.md](./4-WEEK-SPRINT-PLAN.md))

**Post-Launch:**
- Real-time collaboration (multiple estimators on same project)
- Mobile app (iOS/Android)
- Advanced AI: 3D model analysis (BIM/IFC files)
- Integrations: Xero, MYOB, Procore, etc.
- Predictive analytics: "This project is 15% over typical market rate"
- Supplier integrations: Live material pricing

---

## 🤝 Contributing

This is a commercial project. If you'd like to contribute:
1. Fork the repo
2. Create a feature branch
3. Submit a PR with clear description

---

## 📄 License

Proprietary - All rights reserved

---

## 🏆 Vision

**Make construction estimating fast, accurate, and accessible.**

No more 3-day turnarounds. No more missed scope items. No more relying on expensive senior estimators for every quote.

AI that learns from your jobs and gets better every time.

Built for Australian construction. Designed for speed. Powered by intelligence.

Let's build the future of estimating. 🏗️🤖
