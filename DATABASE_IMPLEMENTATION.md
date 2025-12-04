# 💾 SQLite Database Implementation

## Overview
A SQLite database has been implemented to store all accessibility scan reports, enabling historical tracking and report management.

## Database Schema

### Reports Table
```sql
CREATE TABLE reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    domain TEXT,
    scan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    score REAL NOT NULL,
    wcag_level TEXT NOT NULL,
    total_issues INTEGER NOT NULL,
    issues_json TEXT NOT NULL,          -- JSON array of issues
    severity_breakdown TEXT,            -- JSON object with counts
    scan_duration REAL,
    html_content TEXT,                   -- First 10KB of HTML
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Indexes
- `idx_domain` - Fast domain lookups
- `idx_scan_date` - Fast date-based sorting
- `idx_url` - Fast URL lookups

## Features Implemented

### 1. Automatic Report Saving
- Every scan (URL or HTML) is automatically saved to the database
- Reports include:
  - Full issue details (as JSON)
  - Severity breakdown
  - Score and WCAG level
  - Timestamp

### 2. API Endpoints

#### `GET /reports`
Get all historical reports with filtering and pagination
- Query parameters:
  - `limit` (default: 100)
  - `offset` (default: 0)
  - `domain` - Filter by domain
  - `order_by` - Sort column (scan_date, score, total_issues, domain)
  - `order_dir` - Sort direction (ASC/DESC)

#### `GET /reports/{report_id}`
Get a specific report by ID

#### `GET /reports/url/{url}`
Get all reports for a specific URL (for tracking improvements)

#### `DELETE /reports/{report_id}`
Delete a report

#### `GET /reports/statistics`
Get database statistics:
- Total reports
- Average score
- Total issues found
- Unique domains scanned
- Recent scans (last 24 hours)

### 3. Frontend Integration
- Reports page now fetches data from API instead of mock data
- Real-time loading states
- Error handling
- Delete functionality connected to API
- Historical data display with trend indicators

## Database Location
- File: `backend/accessibility_reports.db`
- Automatically created on first run
- SQLite database (no separate server needed)

## Usage

### Backend
The database is automatically initialized when the server starts:
```python
from database import db

# Save a report
report_id = db.save_report(
    url="https://example.com",
    score=85.5,
    wcag_level="AA",
    total_issues=12,
    issues=[...],
    scan_duration=45.2
)

# Get all reports
reports = db.get_all_reports(limit=50, order_by="scan_date", order_dir="DESC")

# Get reports for a URL
url_reports = db.get_reports_by_url("https://example.com")
```

### Frontend
The reports page automatically fetches from the API:
```typescript
const response = await axios.get(`${API_BASE_URL}/reports`, {
  params: { limit: 100, order_by: 'scan_date', order_dir: 'DESC' }
});
```

## Data Structure

### Report Object
```json
{
  "id": 1,
  "url": "https://example.com",
  "domain": "example.com",
  "scan_date": "2024-01-15T10:30:00",
  "score": 85.5,
  "wcag_level": "AA",
  "total_issues": 12,
  "issues": [...],  // Full issue array
  "severity_breakdown": {
    "critical": 0,
    "high": 3,
    "medium": 6,
    "low": 3
  },
  "topIssues": [
    {"type": "missing_alt_text", "count": 5},
    {"type": "low_contrast", "count": 4}
  ],
  "scan_duration": 45.2
}
```

## Benefits

1. **Historical Tracking**: See how accessibility scores change over time
2. **Trend Analysis**: Compare scores between scans
3. **Report Management**: View, search, and delete reports
4. **Performance**: Fast queries with indexes
5. **Persistence**: Data survives server restarts
6. **No Setup Required**: SQLite works out of the box

## Next Steps (Optional Enhancements)

1. **User Authentication**: Add user_id to reports table
2. **Report Sharing**: Generate shareable report links
3. **Export Features**: Bulk export reports
4. **Analytics Dashboard**: Visualize trends over time
5. **Scheduled Scans**: Automatically scan URLs periodically
6. **Report Comparison**: Side-by-side comparison of scans

## Testing

Test the database:
```bash
# Start backend
cd backend
python simple_server.py

# Test endpoints
curl http://localhost:8000/reports
curl http://localhost:8000/reports/statistics
```

## Notes

- Database file is created in `backend/` directory
- HTML content is limited to 10KB to prevent database bloat
- Issues are stored as JSON for flexibility
- All timestamps are in UTC
- Database is thread-safe for concurrent requests

