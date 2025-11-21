# Architecture - AI Web Accessibility Validator & Auto-Fixer

## System Overview

The AI Web Accessibility Validator & Auto-Fixer is a distributed system with multiple entry points and processing pipelines that work together to detect, explain, and fix accessibility issues on web pages.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER INTERACTION LAYER                         │
├──────────────────────┬──────────────────────┬───────────────────────────┤
│  Browser Extension   │   Web Dashboard      │   CI/CD Integration       │
│  (Manifest v3)       │   (Next.js/React)    │   (GitHub Actions)        │
│                      │                      │                           │
│  - Scan This Page    │  - URL/File Upload   │  - PR Hook                │
│  - Issue Overlay     │  - Report Viewer     │  - Auto Scan              │
│  - Quick Apply       │  - Before/After      │  - PR Comment             │
└──────────┬───────────┴──────────┬──────────┴───────────┬───────────────┘
           │                      │                       │
           └──────────────────────┼───────────────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │    API GATEWAY (FastAPI)   │
                    │  - Authentication          │
                    │  - Rate Limiting           │
                    │  - Request Routing         │
                    └─────────────┬─────────────┘
                                  │
           ┌──────────────────────┼───────────────────────┐
           │                      │                       │
    ┌──────▼──────┐      ┌────────▼────────┐    ┌───────▼────────┐
    │   SCAN API  │      │   FIX API       │    │  REPORT API    │
    │  /scan-url  │      │  /auto-fix      │    │  /reports      │
    │  /scan-html │      │  /batch-fix     │    │  /history      │
    └──────┬──────┘      └────────┬────────┘    └───────┬────────┘
           │                      │                       │
           └──────────────────────┼───────────────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
┌───────▼────────┐      ┌─────────▼─────────┐    ┌─────────▼─────────┐
│ HEADLESS       │      │  RULE ENGINE      │    │  PATCH GENERATOR  │
│ RUNNER         │      │  (axe-core)       │    │                   │
│ (Playwright)   │      │                   │    │  - Code Diffs     │
│                │      │  - WCAG 2.2       │    │  - JS Injection   │
│ - Render Page  │      │  - Baseline Rules │    │  - GitHub PR      │
│ - Screenshots  │      │  - DOM Analysis   │    │                   │
│ - DOM Snapshot │      └─────────┬─────────┘    └─────────┬─────────┘
│ - Interactions │                │                         │
└───────┬────────┘                │                         │
        │                         │                         │
        └──────────────┬──────────┴──────────┬──────────────┘
                       │                     │
        ┌──────────────▼──────────────┐     │
        │   COMPUTER VISION MODULE    │     │
        │   (OpenCV/Pillow)           │     │
        │                             │     │
        │  - Screenshot Analysis      │     │
        │  - Contrast Detection       │     │
        │  - Focus Indicator Detection│     │
        │  - Layout Overlap Detection │     │
        └──────────────┬──────────────┘     │
                       │                     │
        ┌──────────────▼──────────────┐     │
        │   NLP/LLM MODULE            │     │
        │   (GPT-4 Vision / BLIP)     │     │
        │                             │     │
        │  - Alt Text Generation      │     │
        │  - Label Suggestions        │     │
        │  - Content Simplification   │     │
        └──────────────┬──────────────┘     │
                       │                     │
        ┌──────────────▼──────────────┐     │
        │   CONTEXT FUSION (AI)       │     │
        │                             │     │
        │  - Merge DOM/CV/NLP Results │     │
        │  - Prioritize Issues        │     │
        │  - Generate Context-Aware   │     │
        │    Fixes                    │     │
        │  - Confidence Scoring       │     │
        └──────────────┬──────────────┘     │
                       │                     │
        ┌──────────────▼──────────────┐     │
        │   DATA LAYER                │     │
        │                             │     │
        │  ┌──────────────────────┐   │     │
        │  │  PostgreSQL          │   │     │
        │  │  - Scans             │   │     │
        │  │  - Issues            │   │     │
        │  │  - Fixes             │   │     │
        │  │  - Reports           │   │     │
        │  └──────────────────────┘   │     │
        │                             │     │
        │  ┌──────────────────────┐   │     │
        │  │  Redis Cache         │   │     │
        │  │  - Scan Results      │   │     │
        │  │  - Screenshots       │   │     │
        │  │  - Rate Limiting     │   │     │
        │  └──────────────────────┘   │     │
        └─────────────────────────────┘     │
                                             │
                    ┌────────────────────────┘
                    │
        ┌───────────▼───────────┐
        │   GITHUB INTEGRATION  │
        │                       │
        │  - OAuth              │
        │  - PR Creation        │
        │  - Test Generation    │
        │  - CI/CD Hooks        │
        └───────────────────────┘
```

## Component Details

### 1. User Interaction Layer

#### Browser Extension (Manifest v3)
- **Location**: `extension/`
- **Technology**: Vanilla JavaScript, Chrome Extension API
- **Responsibilities**:
  - Scan current page in real-time
  - Display issue overlays on page
  - Show issue sidebar
  - Apply fixes for preview
  - Generate GitHub PR

#### Web Dashboard (Next.js/React)
- **Location**: `app/`
- **Technology**: Next.js 14, React, TypeScript, Tailwind CSS
- **Responsibilities**:
  - URL/file upload interface
  - Report viewer with filtering
  - Before/after code comparison
  - Dashboard with score visualization
  - Team collaboration features

#### CI/CD Integration
- **Location**: `.github/workflows/`
- **Technology**: GitHub Actions, GitLab CI
- **Responsibilities**:
  - Automatic scanning on PR
  - PR comments with scan results
  - Block PR if critical issues (optional)

### 2. API Gateway (FastAPI)

- **Location**: `backend/main.py`
- **Technology**: FastAPI, Python
- **Endpoints**:
  - `POST /scan-url` - Scan website URL
  - `POST /scan-html` - Scan raw HTML/CSS/JS
  - `POST /upload-file` - Upload and scan file
  - `POST /auto-fix` - Generate fix for issue
  - `POST /batch-fix` - Batch fix multiple issues
  - `GET /reports` - Get scan reports
  - `GET /wcag-rules` - Get WCAG rules list
  - `GET /health` - Health check

### 3. Processing Pipeline

#### Headless Runner (Playwright)
- **Location**: `backend/services/headless_runner.py`
- **Technology**: Playwright, Python
- **Responsibilities**:
  - Full page rendering with JavaScript
  - Screenshot capture
  - DOM snapshot
  - Network idle detection
  - Interaction simulation (scroll, click, wait)
  - SPA support

#### Rule Engine (axe-core)
- **Location**: `backend/services/scanner.py`
- **Technology**: axe-core Python wrapper
- **Responsibilities**:
  - WCAG 2.2 compliance checks
  - DOM structure analysis
  - Baseline accessibility validation
  - Issue categorization

#### Computer Vision Module
- **Location**: `backend/services/vision_analyzer.py`
- **Technology**: OpenCV, Pillow, NumPy
- **Responsibilities**:
  - Screenshot analysis
  - Color contrast detection on images
  - Focus indicator detection
  - Text overlap detection
  - Layout misalignment detection

#### NLP/LLM Module
- **Location**: `backend/services/ai_engine.py`
- **Technology**: GPT-4 Vision, BLIP, Transformers
- **Responsibilities**:
  - Context-aware alt text generation
  - Form label suggestions
  - Content simplification
  - Multi-language support

#### Context Fusion (AI)
- **Location**: `backend/services/context_fusion.py`
- **Technology**: Python, ML models
- **Responsibilities**:
  - Merge DOM/CV/NLP results
  - Prioritize issues by severity
  - Generate context-aware fixes
  - Confidence scoring

#### Patch Generator
- **Location**: `backend/services/auto_fixer.py`
- **Technology**: Python, difflib
- **Responsibilities**:
  - HTML/CSS/JS diff generation
  - JS injection script creation
  - GitHub PR patch format
  - Component-level fixes (React/Vue)

### 4. Data Layer

#### PostgreSQL Database
- **Tables**:
  - `scans` - Scan history
  - `issues` - Detected issues
  - `fixes` - Generated fixes
  - `reports` - User reports
  - `users` - User accounts
  - `teams` - Team information

#### Redis Cache
- **Purpose**:
  - Cache scan results
  - Store screenshots temporarily
  - Rate limiting
  - Session management

### 5. External Integrations

#### GitHub Integration
- **Location**: `backend/services/github_integration.py`
- **Technology**: GitHub API, OAuth
- **Features**:
  - OAuth authentication
  - PR creation with patches
  - Auto-generated tests (Jest + axe)
  - CI/CD hooks

## Data Flow

### Scan Request Flow

1. **User initiates scan** (extension/dashboard/CI)
2. **API Gateway** receives request
3. **Headless Runner** renders page and captures screenshots
4. **Rule Engine** runs axe-core checks
5. **Computer Vision** analyzes screenshots
6. **NLP/LLM** generates suggestions
7. **Context Fusion** merges results and prioritizes
8. **Patch Generator** creates fixes
9. **Results stored** in database and cache
10. **Response sent** to user

### Fix Application Flow

1. **User reviews fix** in dashboard
2. **User approves/rejects** fix
3. **Patch Generator** creates final patch
4. **User chooses** application method:
   - Browser injection (preview)
   - GitHub PR creation
   - Manual copy-paste
5. **GitHub Integration** creates PR if selected
6. **Results tracked** in database

## Security Architecture

### Authentication
- OAuth 2.0 for GitHub/GitLab
- JWT tokens for API authentication
- Session management via Redis

### Authorization
- Role-based access control (RBAC)
- Team-based permissions
- Repository access with least privilege

### Data Protection
- Encryption at rest (database)
- Encryption in transit (HTTPS/TLS)
- PII masking in logs
- Secure credential storage

### Privacy
- Self-hosted option (no external APIs)
- User consent for AI features
- Data anonymization
- GDPR compliance

## Scalability

### Horizontal Scaling
- API Gateway: Multiple FastAPI instances (load balanced)
- Processing: Queue-based task distribution (Celery/RQ)
- Database: PostgreSQL with read replicas
- Cache: Redis cluster

### Performance Optimization
- Result caching (Redis)
- Async processing (async/await)
- Screenshot optimization (compression)
- Database query optimization

### Monitoring
- Application metrics (Prometheus)
- Logging (ELK stack)
- Error tracking (Sentry)
- Performance monitoring (APM)

## Deployment

### Development
- Local development with Docker Compose
- Hot reload for frontend/backend
- Mock services for AI features

### Production
- Docker containers
- Kubernetes orchestration
- CI/CD pipelines
- Blue-green deployments

### Self-Hosted
- Docker Compose setup
- All components containerized
- Optional external services
- Documentation for deployment

---

**Last Updated**: 2024
**Version**: 1.0
