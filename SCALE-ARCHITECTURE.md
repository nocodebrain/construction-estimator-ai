# Scale Architecture - AI Construction Estimator

**Planning for: 0 → 1,000+ customers, 10,000+ estimates/month**

---

## 🎯 Scale Targets & Constraints

### Growth Trajectory
- **Month 1-3:** 10-50 customers, 100-500 estimates/month
- **Month 4-12:** 50-300 customers, 1,000-5,000 estimates/month
- **Year 2:** 300-1,000 customers, 5,000-20,000 estimates/month
- **Year 3+:** 1,000+ customers, 20,000+ estimates/month

### Performance Requirements
- **Upload & Parse:** <10 seconds for 50MB PDF
- **AI Quantity Extraction:** <30 seconds per drawing page
- **Estimate Generation:** <5 seconds
- **Concurrent Users:** Support 100+ simultaneous sessions
- **Uptime:** 99.9% SLA (enterprise tier)

### Cost Efficiency
- **Target COGS:** <30% of revenue
- **AI Processing:** Must scale without linear cost increase
- **Storage:** Optimize for high volume (TB+ of drawings)

---

## 🏗️ Revised Architecture (Scale-First)

### High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                    CDN (Cloudflare)                          │
│  Static assets, drawing thumbnails, cached responses        │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│               Load Balancer (Railway/AWS ALB)                │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌────▼─────┐ ┌─────▼──────┐
│ Web/API Tier │ │ Web/API  │ │ Web/API    │
│ (Next.js)    │ │ (Next.js)│ │ (Next.js)  │
│ Auto-scale   │ │          │ │            │
└───────┬──────┘ └────┬─────┘ └─────┬──────┘
        │             │              │
        └─────────────┼──────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
┌───────▼──────┐ ┌───▼──────┐ ┌───▼────────────┐
│ Job Queue    │ │ Database │ │ AI Processing  │
│ (BullMQ +    │ │ (Postgres│ │ Cluster        │
│  Redis)      │ │ + Redis) │ │ (Modal Labs)   │
└───────┬──────┘ └────┬─────┘ └───┬────────────┘
        │             │            │
        │             │            │
┌───────▼──────┐ ┌───▼──────┐ ┌──▼─────────────┐
│ Worker Pool  │ │ Read     │ │ S3/R2          │
│ (Processing) │ │ Replicas │ │ (File Storage) │
└──────────────┘ └──────────┘ └────────────────┘
```

---

## 🔧 Backend Architecture Decisions

### Decision 1: Monolith vs. Microservices

**Recommendation: Start with Modular Monolith → Evolve to Microservices**

**Phase 1 (MVP - Months 1-6): Modular Monolith**
- Single Next.js app with clear module boundaries
- All logic in one codebase (but well-separated)
- Easier to develop, deploy, debug
- Lower infrastructure costs

**Module Structure:**
```
/app
  /api
    /projects       - Project CRUD
    /documents      - Upload, parse, manage docs
    /estimates      - Estimate generation, CRUD
    /rate-library   - Rate management
    /jobs           - Background job endpoints
/lib
  /modules
    /document-parser    - PDF parsing logic
    /quantity-extractor - Drawing analysis
    /estimator          - Calculation engine
    /rate-predictor     - ML rate prediction
```

**Phase 2 (Scale - Months 6-18): Extract Services**
When any module becomes a bottleneck:
- Extract to independent service
- Communicate via HTTP/gRPC/message queue
- Scale independently

**Services to Extract First:**
1. **AI Processing Service** (most resource-intensive)
   - Document parsing
   - Computer vision (drawing analysis)
   - GPT-4 API calls
   - Deployed on GPU instances (Modal Labs or AWS)

2. **Worker Service** (long-running tasks)
   - Background jobs (estimate generation, bulk imports)
   - Email notifications
   - Report generation (PDF/Excel)

3. **File Service** (high bandwidth)
   - Upload handling
   - Image processing (thumbnails, compression)
   - Streaming downloads

---

### Decision 2: Database Strategy

**Primary Database: PostgreSQL (Citus for sharding if needed)**

**Why Postgres:**
- ✅ JSONB for flexible data (parsed drawings, metadata)
- ✅ Full-text search (documents, estimates)
- ✅ PostGIS for spatial queries (if needed for maps)
- ✅ Proven at scale (Instagram, Uber use Postgres)
- ✅ Horizontal scaling via Citus or read replicas

**Scale Strategy:**

**Phase 1 (0-100 customers):** Single Postgres instance
- Railway Postgres (16GB RAM, 4 vCPU)
- Adequate for 10k+ estimates

**Phase 2 (100-500 customers):** Read Replicas
- Primary (writes) + 2 Read Replicas (reads)
- Route: Writes → Primary, Reads → Replicas
- Library: Prisma with read replica config

**Phase 3 (500-1000+ customers):** Sharding
- Shard by `company_id` (each company's data on different shard)
- Tool: Citus (Postgres extension for sharding)
- Alternative: Vitess (if Citus doesn't fit)

**Caching Strategy:**
- **Redis** for:
  - Session data (NextAuth)
  - Rate library cache (frequently accessed)
  - Job queue (BullMQ)
  - API response cache (short TTL)

**Data Partitioning:**
```sql
-- Partition historical_jobs by year (older data archived)
CREATE TABLE historical_jobs_2024 PARTITION OF historical_jobs
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Index strategy for fast queries
CREATE INDEX idx_estimates_company_created ON estimates(company_id, created_at DESC);
CREATE INDEX idx_documents_project ON documents(project_id) INCLUDE (file_url, type);
```

---

### Decision 3: AI Processing Architecture

**Challenge:** AI tasks are compute-intensive and slow
- PDF parsing: 1-5 seconds per page
- Computer vision (YOLO): 2-10 seconds per page
- GPT-4 API calls: 2-20 seconds per request

**Scaling Issue:** Can't block HTTP requests waiting for AI

**Solution: Asynchronous Job Queue**

**Architecture:**
```
User uploads drawing
    ↓
API receives file → save to S3 → return immediately (202 Accepted)
    ↓
Enqueue job in Redis (BullMQ)
    ↓
Worker picks up job → calls AI service → processes
    ↓
Worker updates database with results
    ↓
Frontend polls or WebSocket notifies user → "Processing complete"
```

**Implementation:**

**1. Job Queue: BullMQ (Redis-based)**
```typescript
// /lib/queue.ts
import { Queue, Worker } from 'bullmq';

export const documentQueue = new Queue('document-processing', {
  connection: { host: 'redis.example.com' }
});

// Add job when document uploaded
await documentQueue.add('parse-pdf', {
  documentId: 'doc_123',
  fileUrl: 's3://...',
  companyId: 'company_456'
}, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 }
});
```

**2. Worker Pool (Separate Processes)**
```typescript
// /workers/document-worker.ts
const worker = new Worker('document-processing', async (job) => {
  const { documentId, fileUrl } = job.data;
  
  // Call AI service
  const parsed = await aiService.parsePDF(fileUrl);
  
  // Update database
  await prisma.document.update({
    where: { id: documentId },
    data: { parsedData: parsed, status: 'completed' }
  });
}, {
  connection: { host: 'redis.example.com' },
  concurrency: 10  // Process 10 jobs in parallel
});
```

**3. AI Service (Modal Labs for GPU)**
```python
# /ai-service/main.py (deployed on Modal Labs)
import modal

stub = modal.Stub("construction-estimator-ai")

@stub.function(
    gpu="A10G",  # GPU for YOLO inference
    timeout=300,
    concurrency_limit=50  # Max 50 concurrent requests
)
def analyze_drawing(image_url: str):
    # Load YOLO model
    model = load_yolo_model()
    
    # Download image, run inference
    image = download_image(image_url)
    detections = model(image)
    
    return detections
```

**Why Modal Labs:**
- ✅ Serverless GPU (pay per second, auto-scale)
- ✅ Built-in load balancing
- ✅ No infrastructure management
- ✅ Cost-efficient (vs. running 24/7 GPU instances)

**Alternative: AWS Batch + GPU Instances**
- More control, but more ops overhead
- Good for 1000+ customers (cost optimization)

---

### Decision 4: File Storage Strategy

**Primary: Cloudflare R2 (S3-compatible)**

**Why R2:**
- ✅ **Zero egress fees** (S3 charges $0.09/GB for downloads)
- ✅ Cheaper storage ($0.015/GB vs S3 $0.023/GB)
- ✅ Fast global CDN (Cloudflare network)
- ✅ S3-compatible API (easy migration if needed)

**Storage Structure:**
```
/drawings/
  /{company_id}/
    /{project_id}/
      /originals/      - Original uploaded files
      /processed/      - AI-processed (annotated) versions
      /thumbnails/     - Preview images (small PNGs)

/estimates/
  /{company_id}/
    /{estimate_id}/
      /report.pdf      - Exported estimate PDFs
      /boq.xlsx        - Exported BOQs
```

**Optimization Strategy:**
- **Thumbnails:** Generate on upload, cache on CDN
- **Compression:** Compress PDFs (ghostscript) for faster downloads
- **TTL:** Delete old processed files after 90 days (keep originals)
- **Tiering:** Move old files to cheaper cold storage (R2 Glacier-equivalent)

**Cost Estimate:**
- Average project: 10 drawings × 5MB = 50MB
- 10,000 estimates/month = 500GB/month storage
- R2 cost: 500GB × $0.015 = **$7.50/month** (vs S3 $11.50)
- Plus egress: **$0** on R2 (vs S3 ~$45 for 500GB downloads)

**Savings:** ~$50/month at scale → **$600/year**

---

## 📊 Database Schema (Optimized for Scale)

### Key Optimizations

**1. Partitioning by Time (old data separate)**
```sql
-- Estimates partitioned by quarter
CREATE TABLE estimates (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  project_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL,
  ...
) PARTITION BY RANGE (created_at);

CREATE TABLE estimates_2026_q1 PARTITION OF estimates
  FOR VALUES FROM ('2026-01-01') TO ('2026-04-01');
```

**2. Indexes for Fast Queries**
```sql
-- Compound index for common query patterns
CREATE INDEX idx_estimates_company_date ON estimates(company_id, created_at DESC);
CREATE INDEX idx_documents_project_type ON documents(project_id, type);

-- JSONB index for parsed data queries
CREATE INDEX idx_documents_parsed_gin ON documents USING GIN (parsed_data);

-- Full-text search
CREATE INDEX idx_estimates_description_fts ON estimate_items 
  USING GIN (to_tsvector('english', description));
```

**3. Materialized Views for Analytics**
```sql
-- Pre-calculate company usage stats
CREATE MATERIALIZED VIEW company_usage AS
SELECT 
  company_id,
  COUNT(DISTINCT project_id) as total_projects,
  COUNT(*) as total_estimates,
  SUM(total_cost) as total_value,
  MAX(created_at) as last_estimate_date
FROM estimates
GROUP BY company_id;

-- Refresh hourly via cron job
REFRESH MATERIALIZED VIEW CONCURRENTLY company_usage;
```

**4. Connection Pooling**
```typescript
// /lib/db.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pool for scale
  connection: {
    max: 20,  // Max connections
    min: 5,   // Keep 5 warm connections
    idleTimeoutMillis: 60000,
  },
});
```

---

## 🚀 Deployment & Infrastructure

### Phase 1 (MVP - 0-100 customers): Railway

**Why Railway:**
- ✅ Fast deployment (git push → live)
- ✅ Postgres included (no separate RDS setup)
- ✅ Auto-scaling (horizontal pod scaling)
- ✅ Simple pricing ($5-50/month initially)
- ✅ Preview deployments (test before prod)

**Services:**
- **Web/API:** Next.js app (Railway service)
- **Workers:** Separate Node.js service (Railway)
- **Database:** Railway Postgres (16GB shared)
- **Redis:** Railway Redis or Upstash
- **AI:** Modal Labs (GPU serverless)
- **Storage:** Cloudflare R2

**Cost:** ~$100-300/month for 0-100 customers

---

### Phase 2 (Growth - 100-500 customers): Hybrid (Railway + AWS)

**Keep on Railway:**
- Next.js web/API (easier deploys)
- Redis (managed)

**Move to AWS:**
- **Database:** RDS Postgres (dedicated instance, read replicas)
  - Instance: db.r6g.large (2 vCPU, 16GB RAM)
  - Cost: ~$170/month
- **Workers:** ECS Fargate (auto-scaling containers)
- **AI:** Modal Labs or dedicated GPU instance (AWS EC2 G4)

**Why move database:**
- More control (backups, replicas, performance tuning)
- Read replicas for scaling
- Better monitoring (CloudWatch)

**Cost:** ~$800-1,500/month

---

### Phase 3 (Scale - 500-1000+ customers): Full AWS/GCP

**Architecture:**
```
Cloudflare CDN
    ↓
AWS ALB (Load Balancer)
    ↓
ECS Fargate (Next.js containers, auto-scale 10-50 instances)
    ↓
    ├─ RDS Postgres (Primary + 2 Read Replicas)
    ├─ ElastiCache Redis (cache + queue)
    ├─ SQS (job queue backup)
    └─ S3/R2 (file storage)
    
AI Processing:
    ├─ Modal Labs (GPU serverless)
    OR
    ├─ ECS + GPU instances (G4dn.xlarge)
```

**Cost:** ~$3,000-8,000/month for 1,000+ customers

**Revenue at scale:** 1,000 customers × $799/month = **$799k/month**

**COGS:** $8k / $799k = **1%** (excellent margin!)

---

## ⚡ Performance Optimizations

### 1. API Response Caching
```typescript
// Cache rate library queries (rarely change)
import { Redis } from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

export async function getRateLibrary(companyId: string) {
  const cached = await redis.get(`rates:${companyId}`);
  if (cached) return JSON.parse(cached);
  
  const rates = await prisma.rateLibrary.findMany({
    where: { companyId }
  });
  
  await redis.setex(`rates:${companyId}`, 3600, JSON.stringify(rates));
  return rates;
}
```

### 2. Database Query Optimization
```typescript
// Bad: N+1 queries
const projects = await prisma.project.findMany();
for (const project of projects) {
  const estimates = await prisma.estimate.findMany({
    where: { projectId: project.id }  // N queries!
  });
}

// Good: Single query with join
const projects = await prisma.project.findMany({
  include: {
    estimates: true,  // Single JOIN
    _count: {
      select: { estimates: true }
    }
  }
});
```

### 3. Frontend Optimization
- **React Query** for data fetching (caching, deduplication)
- **Next.js Image** for optimized images
- **Code splitting** (lazy load heavy components)
- **CDN caching** for static assets (Cloudflare)

### 4. AI Processing Batching
```typescript
// Process multiple pages in parallel
const pages = [page1, page2, page3];
const results = await Promise.all(
  pages.map(page => aiService.analyzePage(page))
);
```

---

## 📈 Monitoring & Observability

**Critical Metrics to Track:**

1. **Performance:**
   - API response times (p50, p95, p99)
   - AI processing time
   - Database query times
   - Job queue latency

2. **Business:**
   - Estimates generated per day
   - Active users
   - Conversion rate (trial → paid)
   - Churn rate

3. **Infrastructure:**
   - CPU/memory usage
   - Database connections
   - Job queue depth
   - Error rates

**Tools:**
- **APM:** Sentry (error tracking), Datadog/New Relic
- **Logs:** Railway logs → CloudWatch/Datadog
- **Uptime:** UptimeRobot or Pingdom
- **Analytics:** PostHog (product analytics)

---

## 💰 Cost Breakdown (at scale)

### 1,000 Customers ($799/month avg)
**Monthly Revenue:** $799,000

**Infrastructure Costs:**
| Service | Cost/Month | % of Revenue |
|---------|------------|--------------|
| AWS Compute (ECS) | $3,000 | 0.38% |
| RDS Postgres | $800 | 0.10% |
| Redis | $200 | 0.03% |
| Modal Labs (AI) | $2,000 | 0.25% |
| Cloudflare R2 | $50 | 0.01% |
| CDN/bandwidth | $300 | 0.04% |
| Monitoring/Tools | $500 | 0.06% |
| **Total COGS** | **$6,850** | **0.86%** |

**Gross Margin:** 99.14% 🤯

**Why so high:**
- AI processing amortized across customers
- Economies of scale (infrastructure per customer drops)
- Efficient caching reduces repeated work

---

## 🔒 Security & Compliance (for Scale)

**1. Data Isolation:**
- Company data strictly separated (query filters, RLS)
- No cross-company data leaks

**2. Encryption:**
- At rest: Database encrypted, S3/R2 encrypted
- In transit: TLS everywhere (HTTPS, wss://)

**3. Backups:**
- Database: Automated daily backups, 30-day retention
- Files: R2 versioning enabled (recover deleted files)

**4. Compliance (for Enterprise customers):**
- SOC 2 Type II (year 2)
- ISO 27001 (year 3)
- GDPR-compliant (data export, deletion)

---

## 🎯 Final Architecture Recommendations

**Start with:**
1. **Railway** for hosting (MVP speed)
2. **Modal Labs** for AI (serverless GPU, cost-efficient)
3. **BullMQ + Redis** for job queue (proven, scalable)
4. **Cloudflare R2** for storage (zero egress fees)
5. **Modular monolith** (easy to develop, extract services later)

**Migrate to AWS when:**
- 100+ customers (need dedicated database)
- Performance degradation (Railway limits hit)
- Enterprise customers (need SLA, compliance)

**Extract microservices when:**
- AI processing becomes bottleneck (extract first)
- Worker jobs slow down web requests (extract second)
- File uploads congesting web tier (extract third)

---

## ✅ Scale Checklist (Before Building)

- [x] Job queue architecture (async processing)
- [x] Database indexing strategy
- [x] Caching layer (Redis)
- [x] File storage (R2 with CDN)
- [x] AI service separation (Modal Labs)
- [x] Monitoring plan (Sentry, logs)
- [x] Cost model (sub-1% COGS at scale)
- [ ] Load testing plan (Week 4)
- [ ] Disaster recovery plan (backups, failover)

---

**This architecture scales to 10,000+ customers with minimal code changes.**

Decisions made:
1. ✅ Start modular monolith → extract services as needed
2. ✅ Async job queue (don't block HTTP requests)
3. ✅ Serverless AI (Modal Labs) for cost efficiency
4. ✅ R2 for storage (zero egress fees = huge savings)
5. ✅ Railway → AWS migration path (clear, tested)

**Build for today, architect for tomorrow.** 🚀

Let's start coding with confidence. The foundation is solid.
