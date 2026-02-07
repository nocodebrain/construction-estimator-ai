# Technical Architecture - AI Construction Estimator

## 🏗️ System Overview

**Stack Philosophy:** Modern, scalable, AI-first, rapid iteration

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│  Next.js 16 + React 19 + TypeScript + Tailwind         │
│  - Document upload UI                                    │
│  - Drawing viewer & annotation                           │
│  - Estimate editor & review                              │
│  - Rate library management                               │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/WebSocket
┌──────────────────────▼──────────────────────────────────┐
│              API LAYER (Next.js API Routes)              │
│  - Upload handling                                       │
│  - Document processing orchestration                     │
│  - Estimate CRUD                                         │
│  - User auth & permissions                               │
└──────────────────────┬──────────────────────────────────┘
                       │
    ┌──────────────────┼──────────────────┐
    │                  │                  │
┌───▼────┐      ┌─────▼──────┐    ┌─────▼──────┐
│Database│      │AI Services │    │File Storage│
│Postgres│      │Python/GPU  │    │S3/R2       │
└────────┘      └────────────┘    └────────────┘
```

## 🛠️ Technology Stack

### Frontend
**Framework:** Next.js 16 (App Router)
- **Why:** Modern React, server components, API routes, easy deployment
- **UI Library:** shadcn/ui (Radix + Tailwind)
- **State:** React Query for server state, Zustand for client state
- **Forms:** React Hook Form + Zod validation
- **Drawing Viewer:** PDF.js or Fabric.js (for annotations)

### Backend API
**Language:** TypeScript (Node.js)
- **Framework:** Next.js API Routes
- **Why:** Unified codebase, fast iteration, serverless-ready
- **Auth:** NextAuth.js (email/password, OAuth)
- **File Upload:** Multipart handling with sharp for image processing

### AI/ML Services
**Language:** Python 3.11+
- **Framework:** FastAPI (for AI endpoints)
- **Why:** Pythonecosystem for ML, fast HTTP service
- **Deployment:** Separate Docker container, callable via HTTP

**AI Libraries:**
- **Document Parsing:** PyMuPDF, pdfplumber, python-docx
- **Computer Vision:** YOLOv8 (object detection), SegmentAnything (segmentation)
- **OCR:** Tesseract, EasyOCR
- **NLP:** OpenAI GPT-4 API, Claude API (scope analysis)
- **Drawing Analysis:** OpenCV, scikit-image

### Database
**Primary:** PostgreSQL 16
- **Why:** Relational data (projects, estimates, rates), JSONB for flexible fields, full-text search
- **ORM:** Prisma (TypeScript type safety)

**Schema Overview:**
```sql
users (id, email, company_id, role)
companies (id, name, subscription_tier)
projects (id, company_id, name, type, location, status)
documents (id, project_id, type, url, parsed_data)
estimates (id, project_id, total_cost, confidence_score, status)
estimate_items (id, estimate_id, category, description, quantity, unit, rate, total)
rate_library (id, company_id, category, description, unit, rate, source)
historical_jobs (id, company_id, metadata, actual_costs)
```

### File Storage
**Service:** Cloudflare R2 (S3-compatible)
- **Why:** Cheaper than S3, zero egress fees, good for PDFs/images
- **Alternative:** AWS S3 (if need advanced features)

**Storage Structure:**
```
/uploads/
  /{company_id}/
    /{project_id}/
      /drawings/
      /specifications/
      /photos/
```

### Hosting & Deployment
**Platform:** Railway (MVP) → AWS ECS (scale)
- **Why Railway:** Easy deployment, database included, cost-effective for MVP
- **Why AWS later:** More control, GPU instances for CV models, enterprise customers

**Services:**
- **Web/API:** Next.js (Railway App Service)
- **AI Service:** FastAPI (Railway Container or Modal Labs for GPU)
- **Database:** Railway PostgreSQL → AWS RDS (scale)
- **File Storage:** Cloudflare R2

## 🧠 AI/ML Architecture

### 1. Document Processing Pipeline

**Input:** PDF drawings, spec docs, Word files

**Pipeline:**
```
1. Upload → 2. Parse → 3. Extract → 4. Analyze → 5. Store
```

**Step 1: Document Classification**
- Input: PDF/image file
- Model: Simple classifier (GPT-4 Vision or custom)
- Output: Type (drawing, specification, scope, photo)

**Step 2: Text Extraction**
- Tool: PyMuPDF for PDFs, python-docx for Word
- OCR: Tesseract/EasyOCR for scanned docs
- Output: Raw text, tables, metadata

**Step 3: Drawing Analysis** (if applicable)
- Model: YOLOv8 custom-trained on construction drawings
- Detect: Walls, doors, windows, rooms, dimensions, annotations
- Output: Bounding boxes, labels, confidence scores

**Step 4: Quantity Extraction**
- Tool: Parse dimension text (e.g., "3.6m x 4.2m")
- Calculate: Areas, perimeters, counts
- Cross-reference: Drawing scale, unit conversions
- Output: Structured quantities (rooms, walls, openings, etc.)

**Step 5: Specification Parsing**
- Tool: GPT-4 API (structured output)
- Extract: Material specs, finish levels, trade requirements
- Output: JSON structured data

### 2. Historical Learning Engine

**Goal:** Learn typical rates from past jobs

**Data Collection:**
- User uploads past estimates with actual costs
- Extract: Project metadata (type, location, size), line items, rates

**Rate Library Build:**
```sql
CREATE TABLE rate_library (
  id SERIAL PRIMARY KEY,
  company_id INT,
  category VARCHAR(100),  -- e.g., 'Concrete - Slab on Ground'
  description TEXT,
  unit VARCHAR(20),       -- m², m³, item, etc.
  rate_min DECIMAL,
  rate_avg DECIMAL,
  rate_max DECIMAL,
  source VARCHAR(50),     -- 'historical_job', 'industry_avg', 'supplier_quote'
  confidence DECIMAL,     -- 0-1 score
  last_updated TIMESTAMP
);
```

**Learning Algorithm:**
- Group rates by category
- Calculate mean, median, std dev
- Weight recent jobs higher (time decay)
- Detect outliers (flag for review)

**Rate Prediction:**
- Input: Project type, location, size, finish level
- Model: Simple regression or GPT-4 with context
- Output: Suggested rate + confidence interval

### 3. Smart Estimation Engine

**Process:**
```
Quantities (from drawings) + Rates (from library) = Estimate
```

**Calculation:**
```typescript
interface EstimateItem {
  category: string;        // "Concrete - Slabs"
  description: string;     // "150mm thick slab on ground"
  quantity: number;        // 250
  unit: string;           // "m²"
  rate: number;           // 185.50
  total: number;          // 46,375
  confidence: number;     // 0.85
  source: string;         // "historical_average"
}
```

**Subtotals:**
- Trade breakdown (prelims, concrete, framing, services, finishes)
- Contingency (5-15% based on confidence)
- Margin (10-20% configurable)

### 4. Missing Scope Detection

**Approach:** Pattern matching + AI analysis

**Method 1: Checklist Comparison**
- Have a template checklist for each project type
- E.g., "Commercial Fit-Out Checklist":
  - [ ] Demolition
  - [ ] New walls/partitions
  - [ ] Ceiling
  - [ ] Flooring
  - [ ] Lighting
  - [ ] Power/data
  - [ ] HVAC
  - [ ] Plumbing
  - [ ] Painting
  - [ ] Fixtures & fittings

- Compare estimate line items vs checklist
- Flag missing categories

**Method 2: AI Analysis**
- Prompt GPT-4:
  ```
  You are a construction estimator reviewing a quote.
  
  Project: Office fit-out, 500m², Level 3, Sydney CBD
  Estimate items: [list of line items]
  
  Analyze for missing scope. Common omissions:
  - Temporary services
  - Site protection
  - Waste removal
  - Defects liability insurance
  - Authority fees
  - Allowances (furniture, IT, security)
  
  Output: List of likely missing items with risk level (high/medium/low)
  ```

**Method 3: Historical Comparison**
- Find similar past jobs
- Compare line item categories
- Flag categories present in past jobs but missing in current estimate

**Output:**
```json
{
  "missing_scope_alerts": [
    {
      "item": "Temporary site protection",
      "risk_level": "high",
      "typical_cost_range": "$8,000 - $12,000",
      "reasoning": "Similar office fit-outs always include this"
    },
    {
      "item": "Electrical - Data cabling",
      "risk_level": "medium",
      "typical_cost_range": "$15,000 - $25,000",
      "reasoning": "Drawings show workstations but no data points specified"
    }
  ]
}
```

## 📊 Data Models (Prisma Schema)

```prisma
model Company {
  id              String    @id @default(cuid())
  name            String
  subscriptionTier String   // 'starter', 'professional', 'enterprise'
  users           User[]
  projects        Project[]
  rateLibrary     RateLibrary[]
  createdAt       DateTime  @default(now())
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      String   // 'admin', 'estimator', 'viewer'
  companyId String
  company   Company  @relation(fields: [companyId], references: [id])
  createdAt DateTime @default(now())
}

model Project {
  id          String     @id @default(cuid())
  companyId   String
  company     Company    @relation(fields: [companyId], references: [id])
  name        String
  type        String     // 'fit-out', 'new-build', 'renovation', etc.
  location    String
  size        Float?     // area in m²
  status      String     // 'draft', 'in-progress', 'completed'
  documents   Document[]
  estimates   Estimate[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model Document {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id])
  type        String   // 'drawing', 'specification', 'scope', 'photo'
  fileName    String
  fileUrl     String
  parsedData  Json?    // Extracted quantities, text, etc.
  createdAt   DateTime @default(now())
}

model Estimate {
  id             String         @id @default(cuid())
  projectId      String
  project        Project        @relation(fields: [projectId], references: [id])
  totalCost      Float
  confidenceScore Float         // 0-1
  status         String         // 'draft', 'reviewed', 'approved'
  items          EstimateItem[]
  missingScope   Json?          // Alerts array
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
}

model EstimateItem {
  id          String   @id @default(cuid())
  estimateId  String
  estimate    Estimate @relation(fields: [estimateId], references: [id])
  category    String
  description String
  quantity    Float
  unit        String
  rate        Float
  total       Float
  confidence  Float
  source      String   // 'ai', 'historical', 'manual', 'supplier'
  createdAt   DateTime @default(now())
}

model RateLibrary {
  id          String   @id @default(cuid())
  companyId   String
  company     Company  @relation(fields: [companyId], references: [id])
  category    String
  description String
  unit        String
  rateMin     Float?
  rateAvg     Float
  rateMax     Float?
  source      String
  confidence  Float
  lastUpdated DateTime @updatedAt
  createdAt   DateTime @default(now())
}

model HistoricalJob {
  id          String   @id @default(cuid())
  companyId   String
  projectType String
  location    String
  size        Float?
  actualCosts Json     // Full estimate data
  metadata    Json     // Additional project info
  createdAt   DateTime @default(now())
}
```

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Documents
- `POST /api/projects/:id/documents` - Upload document
- `GET /api/documents/:id` - Get document
- `DELETE /api/documents/:id` - Delete document
- `POST /api/documents/:id/parse` - Trigger AI parsing

### Estimates
- `POST /api/projects/:id/estimates` - Create estimate (auto or manual)
- `GET /api/estimates/:id` - Get estimate
- `PATCH /api/estimates/:id` - Update estimate
- `DELETE /api/estimates/:id` - Delete estimate
- `GET /api/estimates/:id/export` - Export PDF/Excel

### Rate Library
- `GET /api/rate-library` - List rates
- `POST /api/rate-library` - Add rate
- `PATCH /api/rate-library/:id` - Update rate
- `DELETE /api/rate-library/:id` - Delete rate
- `POST /api/rate-library/import` - Bulk import from CSV

### AI Services (Python FastAPI)
- `POST /ai/parse-document` - Parse PDF/drawing
- `POST /ai/extract-quantities` - Analyze drawing for quantities
- `POST /ai/analyze-scope` - Parse scope document
- `POST /ai/detect-missing-scope` - Check for omissions
- `POST /ai/predict-rates` - Suggest rates based on context

## 🔒 Security & Permissions

**Authentication:** NextAuth.js
- Email/password (bcrypt hashed)
- OAuth (Google, Microsoft for enterprise)
- JWT tokens (httpOnly cookies)

**Authorization:**
- Role-based: Admin, Estimator, Viewer
- Company-scoped: Users can only see their company's data
- Project-scoped: Share individual projects with external users (future)

**Data Privacy:**
- All uploads encrypted at rest (R2 server-side encryption)
- TLS for all HTTP traffic
- Audit logs for sensitive actions

## 📈 Scalability Considerations

**Current (MVP - 0-50 customers):**
- Single Railway app instance
- Railway Postgres (shared)
- AI processing: Modal Labs serverless GPU

**Scale (50-500 customers):**
- Railway horizontal scaling (multiple instances)
- AWS RDS Postgres (dedicated, read replicas)
- AI processing: Dedicated GPU instance (AWS G4)
- File storage: Cloudflare R2 (unlimited)

**Large Scale (500+ customers):**
- Kubernetes cluster (AWS EKS)
- Postgres sharding by company_id
- Redis caching layer
- AI: Model serving infrastructure (TorchServe, TensorRT)
- CDN for file downloads

## 🧪 Testing Strategy

**Unit Tests:**
- Vitest for TS/React components
- pytest for Python AI services

**Integration Tests:**
- API endpoint tests (supertest)
- Database migrations (Prisma)

**E2E Tests:**
- Playwright for critical user flows
- Upload → Parse → Estimate → Export

**AI Model Tests:**
- Accuracy metrics on labeled test set
- Regression tests (outputs shouldn't change)

## 🚀 Deployment Pipeline

**CI/CD:** GitHub Actions

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]

jobs:
  test:
    - Run tests
    - Lint code
  
  deploy:
    - Build Docker images
    - Push to Railway
    - Run migrations
    - Smoke tests
```

**Environments:**
- **Development:** Local dev (Docker Compose)
- **Staging:** Railway preview deployment
- **Production:** Railway main deployment

---

**This architecture prioritizes:**
1. **Speed to market** (MVP in 4 weeks)
2. **AI-first** (modern ML stack)
3. **Scalability** (starts simple, can grow)
4. **Developer experience** (TypeScript, hot reload, type safety)

Let's build it. 🏗️
