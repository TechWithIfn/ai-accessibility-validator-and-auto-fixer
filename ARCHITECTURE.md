# Architecture Diagram

## System Architecture

```
                      ┌────────────────────────────────────┐
                      │          Browser Extension          │
                      │  - Scan current page                │
                      │  - Inject sidebar UI                │
                      │  - Highlight issues                 │
                      └───────────────┬────────────────────┘
                                      │
                                      ▼
                     ┌────────────────────────────────────┐
                     │            Frontend UI             │
                     │      (React + Tailwind)            │
                     │                                     │
                     │  Pages:                             │
                     │   - URL Scanner                     │
                     │   - Accessibility Report Viewer     │
                     │   - Before/After Code Compare       │
                     │   - Dashboard & Settings            │
                     └─────────────────┬──────────────────┘
                                       │ REST API
                                       ▼
       ┌─────────────────────────────────────────────────────────────────┐
       │                           Backend (FastAPI)                     │
       │  Endpoints:                                                     │
       │   - /scan-url        → fetches DOM, sends to AI processor       │
       │   - /scan-html       → accepts uploaded HTML                    │
       │   - /auto-fix        → returns fixed HTML/CSS                   │
       │                                                                  │
       │  Submodules:                                                     │
       │   ✔ Vision Engine → detects contrast, missing alt images        │
       │   ✔ NLP Engine → generates alt text, readability improvements   │
       │   ✔ WCAG Rule Engine → maps issues to guidelines                │
       │   ✔ Auto-fix Code Engine → generates corrected HTML/CSS         │
       └───────────────────────────┬──────────────────────────────────────┘
                                   │
                                   ▼
                     ┌───────────────────────────────────┐
                     │              Database              │
                     │      (SQLite / MongoDB)           │
                     │ - Save scans                       │
                     │ - Reports                          │
                     │ - Before/After code                │
                     └───────────────────────────────────┘
```

## User Interface Mockups

### Landing Page

```
 ---------------------------------------------------------
| AI Web Accessibility Validator & Auto-Fixer             |
|---------------------------------------------------------|
|  [ Scan a Website ]     [ Upload HTML File ]            |
|                                                          |
|  "Make your website WCAG 2.2 compliant with AI."        |
|----------------------------------------------------------|
```

### URL Scanner Page

```
 ---------------------------------------------------------
| Enter URL to Scan:  [ https://example.com        ] (Scan)
|---------------------------------------------------------|
| Loading animation...                                    |
| "Scanning website for accessibility issues…"            |
 ---------------------------------------------------------
```

### Scan Results Dashboard

```
 ---------------------------------------------------------
| Accessibility Score:  62/100        WCAG Level: AA      |
|---------------------------------------------------------|
| Issues Found: 14                                        |
|---------------------------------------------------------|
| 1. Missing Alt Text (5 items)   [Fix All] [View]        |
| 2. Low Contrast Text (3 items)  [Fix All] [Preview]     |
| 3. Missing ARIA Roles (2 items) [Show Code]             |
| 4. Bad Heading Structure         [Auto-Fix]             |
|---------------------------------------------------------|
```

### Code Comparison View

```
 ---------------------------------------------------------
| BEFORE CODE                      | AFTER AUTO-FIXED      |
|----------------------------------------------------------|
| <img src="banner.png">           | <img src="banner.png" |
|                                  |      alt="Homepage     |
|                                  |      promotional banner">|
 ---------------------------------------------------------
```

### Sidebar (Browser Extension)

```
 -----------------------------------------
| Accessibility Scan Results              |
|-----------------------------------------|
| ⚠ Missing Alt Text (3)                  |
|    - image#hero-banner                  |
|    - image.product-card                 |
|-----------------------------------------|
| ⚠ Low Contrast (2)                      |
|    - <p id="promo-text">                |
|-----------------------------------------|
| [Apply Fixes]   [Download Report]       |
 -----------------------------------------
```

## Component Flow

1. **User Input** → Browser Extension or Frontend UI
2. **API Request** → Backend FastAPI server
3. **Processing** → AI Engines (Vision, NLP, WCAG Rule Engine)
4. **Analysis** → Accessibility issues detected
5. **Fix Generation** → Auto-fix Code Engine generates solutions
6. **Response** → Frontend displays results
7. **User Action** → Apply fixes or download report
8. **Storage** → Save to database (optional)

## Data Flow

```
User Input (URL/HTML)
    ↓
Frontend/Extension
    ↓
REST API Call
    ↓
Backend Processing
    ├─→ HTML Parser (BeautifulSoup)
    ├─→ Vision Engine (Contrast Analysis)
    ├─→ NLP Engine (Alt Text Generation)
    ├─→ WCAG Rule Engine (Compliance Check)
    └─→ Auto-fix Engine (Code Generation)
    ↓
Structured JSON Response
    ↓
Frontend Display
    ├─→ Results Dashboard
    ├─→ Code Comparison
    └─→ Fix Suggestions
    ↓
User Action
    ├─→ Apply Fixes
    ├─→ Download Report
    └─→ Save to Database
```

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python 3.8+
- **Browser Extension**: Manifest V3, Vanilla JavaScript
- **AI/ML**: Transformers, OpenCV, NLP libraries
- **Database**: SQLite (development), MongoDB (production ready)
- **Deployment**: Vercel (frontend), Railway/Heroku (backend)

