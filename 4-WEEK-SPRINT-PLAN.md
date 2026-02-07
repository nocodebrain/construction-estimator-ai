# 4-Week Sprint Plan - AI Construction Estimator

**Start Date:** February 7, 2026  
**Target Launch:** March 7, 2026  
**Total Hours:** ~160 hours (40 hours/week)

---

## 🎯 Weekly Goals Summary

| Week | Focus | Deliverable |
|------|-------|-------------|
| **Week 1** | Foundation & Document Processing | Upload docs, parse content, extract text |
| **Week 2** | AI Drawing Analysis & Quantity Takeoff | Measure quantities from drawings |
| **Week 3** | Estimation Engine & Learning | Generate estimates, learn from history |
| **Week 4** | Polish, Testing & Launch | Production-ready, beta customers |

---

## 📅 Week 1: Foundation & Document Processing

**Goal:** Infrastructure setup + basic document upload/parsing

### Day 1 (Feb 7): Project Setup
**Hours:** 6-8 hours

- [x] Create project structure
  - [x] Initialize Git repo ✅
  - [x] Write PRODUCT-VISION.md ✅
  - [x] Write TECHNICAL-ARCHITECTURE.md ✅
  - [ ] Write 4-WEEK-SPRINT-PLAN.md
- [ ] Set up Next.js 16 project
  - [ ] `npx create-next-app@latest --typescript --tailwind --app`
  - [ ] Install shadcn/ui: `npx shadcn@latest init`
  - [ ] Install core dependencies (Prisma, NextAuth, React Query)
- [ ] Set up Python AI service
  - [ ] FastAPI project structure
  - [ ] Docker container config
  - [ ] Basic health check endpoint
- [ ] Initialize database
  - [ ] Prisma schema (see TECHNICAL-ARCHITECTURE.md)
  - [ ] Run initial migration
  - [ ] Seed with test data

**Output:** Running dev environment (Next.js + FastAPI + Postgres)

---

### Day 2 (Feb 8): File Upload & Storage
**Hours:** 6-8 hours

- [ ] Implement file upload UI
  - [ ] Drag-and-drop component (react-dropzone)
  - [ ] File type validation (PDF, DWG, DXF, Word, images)
  - [ ] Progress indicator
- [ ] Backend upload handling
  - [ ] Next.js API route: `POST /api/upload`
  - [ ] Integrate Cloudflare R2 (or local storage for dev)
  - [ ] Generate secure URLs
  - [ ] Save metadata to database
- [ ] Document list view
  - [ ] Display uploaded files
  - [ ] Preview thumbnails (PDF first page)
  - [ ] Delete functionality

**Output:** Can upload files, store in R2, view list

---

### Day 3 (Feb 9): PDF Parsing
**Hours:** 6-8 hours

- [ ] Python PDF parser service
  - [ ] PyMuPDF integration
  - [ ] Extract: text, tables, images, metadata
  - [ ] FastAPI endpoint: `POST /ai/parse-pdf`
- [ ] Text extraction pipeline
  - [ ] Parse structured text (headings, paragraphs)
  - [ ] Extract tables (convert to JSON)
  - [ ] Detect dimensions (regex: "3.6m x 4.2m")
- [ ] Frontend: Display parsed data
  - [ ] JSON viewer for debugging
  - [ ] Basic text display

**Output:** Upload PDF → see extracted text & tables

---

### Day 4 (Feb 10): Drawing Viewer
**Hours:** 6-8 hours

- [ ] PDF.js integration
  - [ ] Render PDF in browser
  - [ ] Zoom, pan, rotate
  - [ ] Page navigation (multi-page drawings)
- [ ] Annotation layer (basic)
  - [ ] Click to measure distance (manual mode)
  - [ ] Draw rectangles for rooms
  - [ ] Add notes/labels
- [ ] Save annotations to database

**Output:** Can view drawings, manually measure, annotate

---

### Day 5 (Feb 11): OCR & Cleanup
**Hours:** 6-8 hours

- [ ] OCR for scanned/image PDFs
  - [ ] Tesseract integration
  - [ ] Endpoint: `POST /ai/ocr`
  - [ ] Combine OCR text with native PDF text
- [ ] Text cleaning
  - [ ] Remove duplicates
  - [ ] Fix encoding issues
  - [ ] Normalize units (m, mm, feet → meters)
- [ ] Testing & bug fixes
  - [ ] Test with 5-10 sample drawings
  - [ ] Fix parsing errors
  - [ ] Performance optimization

**Output:** Reliable text extraction from any PDF/image

---

## 📅 Week 2: AI Drawing Analysis & Quantity Takeoff

**Goal:** Automatically detect building elements and calculate quantities

### Day 6 (Feb 14): Computer Vision Setup
**Hours:** 6-8 hours

- [ ] YOLOv8 environment setup
  - [ ] Install ultralytics, torch, opencv
  - [ ] Test pre-trained YOLO model
- [ ] Dataset research
  - [ ] Find construction drawing datasets (Kaggle, GitHub)
  - [ ] OR: Create small labeled dataset (20-30 images)
  - [ ] Label: walls, doors, windows, rooms, dimensions, text
- [ ] Model fine-tuning
  - [ ] Train YOLOv8 on drawing dataset
  - [ ] Iterate: label more → retrain
  - [ ] Target: 70%+ accuracy on test set

**Output:** YOLO model detects walls/doors/windows in drawings

---

### Day 7 (Feb 15): Object Detection Pipeline
**Hours:** 6-8 hours

- [ ] Integrate YOLO into FastAPI
  - [ ] Endpoint: `POST /ai/detect-elements`
  - [ ] Input: PDF page image
  - [ ] Output: Bounding boxes + labels + confidence
- [ ] Post-processing
  - [ ] Filter low-confidence detections (<0.5)
  - [ ] Group nearby detections (e.g., door + frame)
  - [ ] Extract counts (number of doors, windows, etc.)
- [ ] Frontend visualization
  - [ ] Overlay bounding boxes on drawing
  - [ ] Show labels and confidence scores
  - [ ] Click to view details

**Output:** Upload drawing → see detected elements overlaid

---

### Day 8 (Feb 16): Dimension Extraction
**Hours:** 6-8 hours

- [ ] Text recognition in drawings
  - [ ] Detect dimension text (e.g., "3600", "4.2m")
  - [ ] Associate dimensions with elements (wall length)
  - [ ] Parse scale (e.g., "1:100")
- [ ] Measurement calculation
  - [ ] Extract room dimensions from text
  - [ ] Calculate areas (length × width)
  - [ ] Calculate perimeters, wall lengths
  - [ ] Handle irregular shapes (count grid squares)
- [ ] Quantity extraction
  - [ ] Room areas (m²)
  - [ ] Wall lengths (linear meters)
  - [ ] Door/window counts
  - [ ] Ceiling/floor areas

**Output:** Drawing → structured quantities (JSON)

---

### Day 9 (Feb 17): Manual Correction UI
**Hours:** 6-8 hours

- [ ] Editable quantity table
  - [ ] Display AI-extracted quantities
  - [ ] Click to edit (inline editing)
  - [ ] Add missing items manually
  - [ ] Delete incorrect items
- [ ] Validation
  - [ ] Check for negative values
  - [ ] Warn if units are inconsistent
  - [ ] Auto-calculate totals
- [ ] Save/load state
  - [ ] Save corrections to database
  - [ ] Re-load for future edits

**Output:** User can review and correct AI measurements

---

### Day 10 (Feb 18): Integration & Testing
**Hours:** 6-8 hours

- [ ] End-to-end pipeline test
  - [ ] Upload drawing → detect → extract → review → save
  - [ ] Test with 5+ real drawings
  - [ ] Measure accuracy (compare AI vs manual takeoff)
- [ ] Bug fixes
  - [ ] Fix detection errors
  - [ ] Improve dimension parsing
  - [ ] Handle edge cases (multi-page, rotated, low quality)
- [ ] Performance optimization
  - [ ] Parallelize processing (if multiple pages)
  - [ ] Cache results
  - [ ] Progress indicators for long tasks

**Output:** Reliable quantity extraction from drawings

---

## 📅 Week 3: Estimation Engine & Historical Learning

**Goal:** Apply rates, generate estimates, learn from past jobs

### Day 11 (Feb 21): Rate Library Foundation
**Hours:** 6-8 hours

- [ ] Rate library UI
  - [ ] Table view: Category, Description, Unit, Rate
  - [ ] Add/Edit/Delete rates
  - [ ] Search and filter
  - [ ] Import from CSV
- [ ] Seed with industry rates
  - [ ] Research: Rawlinsons, Cordell, local rates
  - [ ] Create starter library (50-100 common items)
  - [ ] Categories: Prelims, Concrete, Framing, Services, Finishes
- [ ] Database storage
  - [ ] Prisma model: RateLibrary
  - [ ] API: CRUD endpoints

**Output:** Functional rate library (view, add, edit rates)

---

### Day 12 (Feb 22): Estimation Calculation
**Hours:** 6-8 hours

- [ ] Estimate generation logic
  - [ ] Match quantities to rate library (fuzzy matching)
  - [ ] Calculate: Quantity × Rate = Total
  - [ ] Group by trade (prelims, concrete, etc.)
  - [ ] Calculate subtotals, contingency, margin
- [ ] Estimate editor UI
  - [ ] Table: Description, Qty, Unit, Rate, Total
  - [ ] Editable (inline editing)
  - [ ] Auto-recalculate on changes
  - [ ] Add/remove line items
- [ ] Estimate summary
  - [ ] Total cost (bold, prominent)
  - [ ] Breakdown by trade
  - [ ] Confidence score (0-100%)

**Output:** Generate estimate from quantities + rates

---

### Day 13 (Feb 23): Historical Job Upload
**Hours:** 6-8 hours

- [ ] Upload past estimates
  - [ ] CSV/Excel import
  - [ ] Parse: Project metadata, line items, actual costs
  - [ ] Validation (check required fields)
- [ ] Historical job database
  - [ ] Prisma model: HistoricalJob
  - [ ] Store: Project type, location, size, costs (JSONB)
- [ ] Rate learning algorithm
  - [ ] Extract rates from historical jobs
  - [ ] Group by category
  - [ ] Calculate: Min, Avg, Max, Std Dev
  - [ ] Update rate library with learned rates
- [ ] Confidence scoring
  - [ ] More historical data = higher confidence
  - [ ] Recent jobs weighted higher
  - [ ] Outliers flagged for review

**Output:** Upload past jobs → rate library improves

---

### Day 14 (Feb 24): Rate Prediction
**Hours:** 6-8 hours

- [ ] Context-aware rate suggestion
  - [ ] Input: Project type, location, size, finish level
  - [ ] Algorithm: Filter historical jobs by similarity
  - [ ] Suggest rate with confidence interval
- [ ] GPT-4 integration (optional)
  - [ ] Prompt: "Suggest rate for [item] in [context]"
  - [ ] Use as fallback if no historical data
- [ ] Rate recommendation UI
  - [ ] Show suggested rate + range
  - [ ] Display confidence score
  - [ ] Show historical basis ("Based on 12 past jobs")
  - [ ] User can accept or override

**Output:** AI suggests rates based on project context

---

### Day 15 (Feb 25): Missing Scope Detection
**Hours:** 6-8 hours

- [ ] Template checklist system
  - [ ] Create checklists for common project types
    - [ ] Office fit-out
    - [ ] Warehouse fit-out
    - [ ] Retail fit-out
  - [ ] Store in database (JSON)
- [ ] Comparison logic
  - [ ] Match estimate items to checklist categories
  - [ ] Flag missing categories
  - [ ] Suggest typical cost range for missing items
- [ ] GPT-4 analysis (advanced)
  - [ ] Prompt: "Review estimate for missing scope"
  - [ ] Contextual analysis (e.g., "electrical rough-in but no fixtures")
  - [ ] Risk scoring (high/medium/low)
- [ ] Alerts UI
  - [ ] Warning panel: "Potential missing scope"
  - [ ] List of missing items with risk level
  - [ ] Click to add to estimate

**Output:** Automatically detect and flag missing scope

---

## 📅 Week 4: Polish, Testing & Launch

**Goal:** Production-ready product, beta customer onboarding

### Day 16 (Feb 28): Export & Reporting
**Hours:** 6-8 hours

- [ ] PDF export
  - [ ] Library: @react-pdf/renderer or jsPDF
  - [ ] Template: Professional estimate format
  - [ ] Include: Project details, line items, totals, T&Cs
  - [ ] Branding (company logo, colors)
- [ ] Excel export
  - [ ] Library: xlsx
  - [ ] Format: BOQ template
  - [ ] Multiple sheets: Summary, Line Items, Rates
- [ ] CSV export (lightweight)
- [ ] Download/email functionality

**Output:** Export estimates as PDF, Excel, CSV

---

### Day 17 (Mar 1): Multi-User & Permissions
**Hours:** 6-8 hours

- [ ] User authentication (NextAuth.js)
  - [ ] Email/password signup/login
  - [ ] Password reset flow
  - [ ] Session management
- [ ] Company accounts
  - [ ] Users belong to companies
  - [ ] Data isolation (company-scoped queries)
- [ ] Role-based access
  - [ ] Admin: Full access
  - [ ] Estimator: Create/edit estimates
  - [ ] Viewer: Read-only
- [ ] User management UI
  - [ ] Invite team members
  - [ ] Assign roles
  - [ ] View activity logs

**Output:** Multi-user support with proper permissions

---

### Day 18 (Mar 2): UX Polish & Responsiveness
**Hours:** 6-8 hours

- [ ] UI refinement
  - [ ] Consistent spacing, typography
  - [ ] Loading states (skeletons, spinners)
  - [ ] Error states (friendly messages)
  - [ ] Empty states (onboarding guidance)
- [ ] Mobile responsiveness
  - [ ] Test on tablet/phone
  - [ ] Responsive tables (stack on mobile)
  - [ ] Touch-friendly buttons
- [ ] Performance optimization
  - [ ] Lazy loading (code splitting)
  - [ ] Image optimization (Next.js Image)
  - [ ] Database query optimization
- [ ] Accessibility
  - [ ] Keyboard navigation
  - [ ] Screen reader labels
  - [ ] Color contrast checks

**Output:** Polished, fast, accessible UI

---

### Day 19 (Mar 3): Testing & Bug Fixes
**Hours:** 6-8 hours

- [ ] E2E testing (Playwright)
  - [ ] Happy path: Upload → Estimate → Export
  - [ ] Error cases: Invalid file, parsing failure
  - [ ] User flows: Signup → Create project → Upload docs
- [ ] Manual testing
  - [ ] Test with 10+ real-world drawings
  - [ ] Different project types (fit-out, renovation, etc.)
  - [ ] Edge cases (missing data, corrupted files)
- [ ] Bug triage and fixes
  - [ ] Fix critical bugs (data loss, crashes)
  - [ ] Document known issues
  - [ ] Create improvement backlog

**Output:** Stable, tested product

---

### Day 20 (Mar 4): Deployment & Beta Launch
**Hours:** 6-8 hours

- [ ] Production deployment
  - [ ] Deploy Next.js to Railway
  - [ ] Deploy FastAPI to Railway (or Modal Labs)
  - [ ] Configure Cloudflare R2
  - [ ] Set up Postgres (Railway)
  - [ ] Environment variables
  - [ ] SSL/DNS setup (custom domain)
- [ ] Monitoring setup
  - [ ] Error tracking (Sentry)
  - [ ] Analytics (PostHog or similar)
  - [ ] Uptime monitoring
- [ ] Documentation
  - [ ] User guide (how to use the platform)
  - [ ] API docs (for future integrations)
  - [ ] Admin guide (managing users, rates)
- [ ] Beta customer onboarding
  - [ ] Reach out to 3-5 target customers
  - [ ] Onboarding call (demo + setup)
  - [ ] Load their historical data
  - [ ] First estimate walkthrough
  - [ ] Collect feedback

**Output:** Live product with beta customers using it

---

## 🎯 Daily Workflow

**Morning (9am-12pm):**
- Review yesterday's progress
- Plan today's tasks (prioritize)
- Focus work: Build features (no distractions)

**Afternoon (1pm-5pm):**
- Continue building
- Test what was built
- Document changes
- Commit to Git (meaningful commits)

**Evening (optional):**
- Review day's work
- Plan tomorrow
- Research/learning (if needed)

**Weekly Review (Fridays):**
- Demo to stakeholders
- Retrospective: What went well, what didn't
- Adjust next week's plan if needed

---

## 🚧 Risk Mitigation

**Risk 1: Drawing analysis not accurate enough**
- **Mitigation:** Manual correction UI (user can fix AI errors)
- **Fallback:** Start with manual quantity entry, add AI over time

**Risk 2: Too ambitious for 4 weeks**
- **Mitigation:** MVP features only (cut nice-to-haves)
- **Fallback:** Extend to 6 weeks if needed (still fast)

**Risk 3: Historical data too sparse**
- **Mitigation:** Seed with industry average rates
- **Fallback:** Manual rate entry with library

**Risk 4: No beta customers**
- **Mitigation:** Use personal network (construction contacts)
- **Fallback:** Demo to investors, get feedback, iterate

---

## 📊 Success Metrics

**Week 1:**
- [ ] Can upload and parse documents
- [ ] Database and API working

**Week 2:**
- [ ] Can detect elements in drawings (70%+ accuracy)
- [ ] Extract quantities automatically

**Week 3:**
- [ ] Can generate full estimate
- [ ] Missing scope detection working
- [ ] Rate library functional

**Week 4:**
- [ ] Production deployment live
- [ ] 3+ beta customers onboarded
- [ ] First paying customer signed

---

## 🎉 Launch Checklist

- [ ] Product deployed to production
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Monitoring and error tracking live
- [ ] User documentation complete
- [ ] Beta customers onboarded
- [ ] Feedback collection process in place
- [ ] Marketing materials ready (landing page, demo video)
- [ ] Payment/billing system integrated (Stripe)
- [ ] Support channels active (email, chat)

---

**Let's build something transformative.** 🏗️🤖

This 4-week plan is aggressive but achievable. Focus, ship, iterate.
