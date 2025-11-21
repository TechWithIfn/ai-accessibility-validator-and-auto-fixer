"""
AI Web Accessibility Validator & Auto-Fixer - FastAPI Backend
Main application entry point with all API endpoints
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any
import uvicorn
from pathlib import Path

from services.scanner import AccessibilityScanner
from services.ai_engine import AIEngine
from services.auto_fixer import AutoFixer

app = FastAPI(
    title="AI Web Accessibility Validator & Auto-Fixer",
    description="Backend API for scanning and fixing web accessibility issues",
    version="1.0.0"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services (lazy initialization to handle import errors)
scanner = None
ai_engine = None
auto_fixer = None

def get_scanner():
    """Lazy load scanner to handle import errors gracefully"""
    global scanner
    if scanner is None:
        scanner = AccessibilityScanner()
    return scanner

def get_ai_engine():
    """Lazy load AI engine to handle import errors gracefully"""
    global ai_engine
    if ai_engine is None:
        ai_engine = AIEngine()
    return ai_engine

def get_auto_fixer():
    """Lazy load auto fixer to handle import errors gracefully"""
    global auto_fixer
    if auto_fixer is None:
        auto_fixer = AutoFixer()
    return auto_fixer


# Pydantic models for request/response
class ScanURLRequest(BaseModel):
    url: str  # Changed to str for better compatibility


class ScanHTMLRequest(BaseModel):
    html: str
    css: Optional[str] = None
    js: Optional[str] = None


class FixRequest(BaseModel):
    issue_id: str
    element_selector: str
    issue_type: str
    original_code: str


class ScanResponse(BaseModel):
    success: bool
    url: Optional[str] = None
    issues: List[Dict[str, Any]]
    total_issues: int
    wcag_level: str
    score: float


class FixResponse(BaseModel):
    success: bool
    fixed_code: str
    explanation: str
    before_code: str
    after_code: str


@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "AI Web Accessibility Validator & Auto-Fixer API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "accessibility-validator"}


@app.post("/scan-url", response_model=ScanResponse)
async def scan_url(request: ScanURLRequest):
    """
    Scan a website URL for accessibility issues
    
    Input: Website URL
    Output: Structured JSON report of issues
    """
    try:
        url = str(request.url)
        
        # Get scanner instance
        scanner_instance = get_scanner()
        
        # Fetch and parse the website
        html_content, css_content, js_content = await scanner_instance.fetch_website(url)
        
        # Run comprehensive accessibility scan
        issues = await scanner_instance.scan_comprehensive(html_content, css_content, js_content, url)
        
        # Calculate score and WCAG level
        score = scanner_instance.calculate_accessibility_score(issues)
        wcag_level = scanner_instance.determine_wcag_level(issues)
        
        return ScanResponse(
            success=True,
            url=url,
            issues=issues,
            total_issues=len(issues),
            wcag_level=wcag_level,
            score=score
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scanning URL: {str(e)}")


@app.post("/scan-html", response_model=ScanResponse)
async def scan_html(request: ScanHTMLRequest):
    """
    Scan raw HTML/CSS/JS for accessibility issues
    
    Input: Raw HTML, optional CSS and JS
    Output: Structured JSON report of issues
    """
    try:
        # Get scanner instance
        scanner_instance = get_scanner()
        
        # Run comprehensive accessibility scan
        issues = await scanner_instance.scan_comprehensive(
            request.html,
            request.css or "",
            request.js or "",
            "uploaded-content"
        )
        
        # Calculate score and WCAG level
        score = scanner_instance.calculate_accessibility_score(issues)
        wcag_level = scanner_instance.determine_wcag_level(issues)
        
        return ScanResponse(
            success=True,
            issues=issues,
            total_issues=len(issues),
            wcag_level=wcag_level,
            score=score
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scanning HTML: {str(e)}")


@app.post("/upload-file")
async def upload_html_file(file: UploadFile = File(...)):
    """
    Upload and scan an HTML file
    
    Input: HTML file upload
    Output: Structured JSON report of issues
    """
    try:
        content = await file.read()
        html_content = content.decode('utf-8')
        
        # Get scanner instance
        scanner_instance = get_scanner()
        
        # Run scan
        issues = await scanner_instance.scan_comprehensive(html_content, "", "", file.filename)
        
        score = scanner_instance.calculate_accessibility_score(issues)
        wcag_level = scanner_instance.determine_wcag_level(issues)
        
        return ScanResponse(
            success=True,
            issues=issues,
            total_issues=len(issues),
            wcag_level=wcag_level,
            score=score
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


@app.post("/auto-fix", response_model=FixResponse)
async def auto_fix_issue(request: FixRequest):
    """
    Generate automatic fix for a specific accessibility issue
    
    Input: Issue details (type, element selector, original code)
    Output: Fixed code with explanation
    """
    try:
        fixer_instance = get_auto_fixer()
        fix_result = await fixer_instance.generate_fix(
            issue_type=request.issue_type,
            element_selector=request.element_selector,
            original_code=request.original_code,
            issue_id=request.issue_id
        )
        
        return FixResponse(
            success=True,
            fixed_code=fix_result["fixed_code"],
            explanation=fix_result["explanation"],
            before_code=request.original_code,
            after_code=fix_result["fixed_code"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating fix: {str(e)}")


@app.post("/batch-fix")
async def batch_fix_issues(issues: List[FixRequest]):
    """
    Generate fixes for multiple issues at once
    
    Input: List of issue fix requests
    Output: List of fix responses
    """
    try:
        results = []
        for issue in issues:
            fixer_instance = get_auto_fixer()
            fix_result = await fixer_instance.generate_fix(
                issue_type=issue.issue_type,
                element_selector=issue.element_selector,
                original_code=issue.original_code,
                issue_id=issue.issue_id
            )
            results.append({
                "issue_id": issue.issue_id,
                "success": True,
                "fixed_code": fix_result["fixed_code"],
                "explanation": fix_result["explanation"]
            })
        
        return {"success": True, "fixes": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error batch fixing: {str(e)}")


@app.get("/wcag-rules")
async def get_wcag_rules():
    """Get list of all WCAG 2.2 rules that are being checked"""
    scanner_instance = get_scanner()
    return {
        "rules": scanner_instance.get_wcag_rules(),
        "version": "2.2"
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

