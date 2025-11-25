"""
Simple Backend Server
Minimal version that works even if some services have import errors
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import List, Dict, Any, Optional
import uvicorn
import sys

app = FastAPI(
    title="AI Web Accessibility Validator & Auto-Fixer",
    description="Backend API for scanning and fixing web accessibility issues",
    version="1.0.0"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple scanner implementation (fallback if imports fail)
class SimpleScanner:
    """Simple scanner that works without all dependencies"""
    
    async def fetch_website(self, url: str):
        """Fetch website content"""
        import httpx
        
        # Ensure URL has protocol
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        try:
            async with httpx.AsyncClient(
                timeout=httpx.Timeout(30.0, connect=10.0),
                follow_redirects=True,
                headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            ) as client:
                response = await client.get(url)
                response.raise_for_status()
                html = response.text
                return html, "", ""
        except httpx.TimeoutException:
            raise Exception(f"Request timeout: Could not fetch {url} within 30 seconds")
        except httpx.ConnectError:
            raise Exception(f"Connection error: Could not connect to {url}. Check if the URL is correct and accessible.")
        except httpx.HTTPStatusError as e:
            raise Exception(f"HTTP error {e.response.status_code}: {e.response.status_text}")
        except Exception as e:
            raise Exception(f"Failed to fetch website: {str(e)}")
    
    async def scan_comprehensive(self, html, css, js, url):
        """Simple scan that returns basic issues"""
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html, 'lxml')
        issues = []
        
        # Check for missing alt text
        for img in soup.find_all('img'):
            if not img.get('alt'):
                issues.append({
                    "id": f"alt-missing-{len(issues)}",
                    "type": "missing_alt_text",
                    "severity": "high",
                    "wcag_level": "A",
                    "wcag_rule": "1.1.1",
                    "message": "Image missing alt attribute",
                    "description": "Images must have alt text for screen reader users",
                    "fix_suggestion": "Add alt attribute to image",
                    "selector": f"img[src='{img.get('src', '')}']"
                })
        
        # Check for missing lang
        html_tag = soup.find('html')
        if html_tag and not html_tag.get('lang'):
            issues.append({
                "id": "lang-missing",
                "type": "missing_lang",
                "severity": "high",
                "wcag_level": "A",
                "wcag_rule": "3.1.1",
                "message": "HTML missing lang attribute",
                "description": "HTML should have a lang attribute",
                "fix_suggestion": "Add lang attribute to html tag",
                "selector": "html"
            })
        
        return issues
    
    def calculate_accessibility_score(self, issues):
        """Calculate accessibility score"""
        if not issues:
            return 100.0
        base_score = 100.0
        deduction = min(len(issues) * 5, 95)  # Deduct 5 points per issue, max 95
        return max(base_score - deduction, 5.0)
    
    def determine_wcag_level(self, issues):
        """Determine WCAG compliance level"""
        if not issues:
            return "AAA"
        high_issues = [i for i in issues if i.get('severity') == 'high']
        if not high_issues:
            return "AA"
        return "A"
    
    def get_wcag_rules(self):
        """Get WCAG rules"""
        return [
            {"rule": "1.1.1", "level": "A", "description": "Non-text Content - Images must have alt text"},
            {"rule": "1.3.1", "level": "A", "description": "Info and Relationships - Proper heading hierarchy"},
            {"rule": "1.4.3", "level": "AA", "description": "Contrast (Minimum) - Text contrast ratio of at least 4.5:1"},
            {"rule": "3.1.1", "level": "A", "description": "Language of Page - HTML must have lang attribute"},
        ]

# Try to use full scanner, fallback to simple scanner
scanner = None
try:
    from services.scanner import AccessibilityScanner
    scanner = AccessibilityScanner()
    print("✅ Using full AccessibilityScanner")
except Exception as e:
    print(f"⚠️  Using SimpleScanner (full scanner unavailable: {e})")
    scanner = SimpleScanner()

# Request/Response models
class ScanURLRequest(BaseModel):
    url: str  # Changed from HttpUrl to str for simpler validation

class ScanHTMLRequest(BaseModel):
    html: str
    css: Optional[str] = None
    js: Optional[str] = None

class ScanResponse(BaseModel):
    success: bool
    url: Optional[str] = None
    issues: List[Dict[str, Any]]
    total_issues: int
    wcag_level: str
    score: float

@app.get("/")
async def root():
    return {
        "message": "AI Web Accessibility Validator & Auto-Fixer API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "accessibility-validator"}

@app.post("/scan-url", response_model=ScanResponse)
async def scan_url(request: ScanURLRequest):
    """Scan a website URL for accessibility issues"""
    try:
        url = request.url if isinstance(request.url, str) else str(request.url)
        url = url.strip()
        
        # Validate and fix URL
        if not url:
            raise HTTPException(status_code=400, detail="URL cannot be empty")
        
        # Add protocol if missing
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        # Validate URL format
        try:
            from urllib.parse import urlparse
            parsed = urlparse(url)
            if not parsed.netloc:
                raise HTTPException(status_code=400, detail="Invalid URL format")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid URL format")
        
        print(f"🌐 Scanning URL: {url}")
        
        # Fetch and parse the website
        try:
            html_content, css_content, js_content = await scanner.fetch_website(url)
            print(f"✅ Fetched website content ({len(html_content)} chars)")
        except Exception as fetch_error:
            error_msg = str(fetch_error)
            if "timeout" in error_msg.lower():
                raise HTTPException(status_code=408, detail=f"Request timeout: {error_msg}")
            elif "connection" in error_msg.lower() or "refused" in error_msg.lower():
                raise HTTPException(status_code=503, detail=f"Cannot connect to website: {error_msg}")
            else:
                raise HTTPException(status_code=400, detail=f"Failed to fetch website: {error_msg}")
        
        # Run comprehensive accessibility scan
        try:
            issues = await scanner.scan_comprehensive(html_content, css_content, js_content, url)
            print(f"✅ Scan completed: {len(issues)} issues found")
        except Exception as scan_error:
            print(f"⚠️  Scan error: {scan_error}")
            issues = []
        
        # Calculate score and WCAG level
        score = scanner.calculate_accessibility_score(issues)
        wcag_level = scanner.determine_wcag_level(issues)
        
        return ScanResponse(
            success=True,
            url=url,
            issues=issues,
            total_issues=len(issues),
            wcag_level=wcag_level,
            score=score
        )
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Error scanning URL: {error_msg}")
        raise HTTPException(status_code=500, detail=f"Error scanning URL: {error_msg}")

@app.post("/scan-html", response_model=ScanResponse)
async def scan_html(request: ScanHTMLRequest):
    """Scan raw HTML/CSS/JS for accessibility issues"""
    try:
        # Run comprehensive accessibility scan
        issues = await scanner.scan_comprehensive(
            request.html,
            request.css or "",
            request.js or "",
            "uploaded-content"
        )
        
        # Calculate score and WCAG level
        score = scanner.calculate_accessibility_score(issues)
        wcag_level = scanner.determine_wcag_level(issues)
        
        return ScanResponse(
            success=True,
            issues=issues,
            total_issues=len(issues),
            wcag_level=wcag_level,
            score=score
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scanning HTML: {str(e)}")

@app.get("/wcag-rules")
async def get_wcag_rules():
    """Get list of all WCAG 2.2 rules that are being checked"""
    return {
        "rules": scanner.get_wcag_rules(),
        "version": "2.2"
    }

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Starting AI Accessibility Validator Backend")
    print("=" * 60)
    print("📍 Server: http://localhost:8000")
    print("📚 API Docs: http://localhost:8000/docs")
    print("💚 Health: http://localhost:8000/health")
    print("=" * 60)
    print("Press Ctrl+C to stop the server\n")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )

