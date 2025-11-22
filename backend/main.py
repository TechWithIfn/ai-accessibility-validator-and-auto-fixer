"""
AI Web Accessibility Validator & Auto-Fixer - FastAPI Backend
Main application entry point with all API endpoints
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, HttpUrl, Field, validator
from typing import List, Optional, Dict, Any
import uvicorn
from pathlib import Path
import logging
import traceback

from services.scanner import AccessibilityScanner
from services.ai_engine import AIEngine
from services.auto_fixer import AutoFixer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

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
    url: str = Field(..., min_length=1, description="Website URL to scan")
    
    @validator('url')
    def validate_url(cls, v):
        if not v or not v.strip():
            raise ValueError('URL cannot be empty')
        return v.strip()


class ScanHTMLRequest(BaseModel):
    html: str = Field(..., min_length=1, description="HTML content to scan")
    css: Optional[str] = Field(None, description="Optional CSS content")
    js: Optional[str] = Field(None, description="Optional JavaScript content")
    
    @validator('html')
    def validate_html(cls, v):
        if not v or not v.strip():
            raise ValueError('HTML content cannot be empty')
        return v.strip()


class FixRequest(BaseModel):
    issue_id: str = Field(..., min_length=1, description="Unique issue identifier")
    element_selector: str = Field(..., min_length=1, description="CSS selector for the element")
    issue_type: str = Field(..., min_length=1, description="Type of accessibility issue")
    original_code: str = Field(..., min_length=1, description="Original HTML code to fix")
    
    @validator('issue_id', 'element_selector', 'issue_type', 'original_code')
    def validate_non_empty(cls, v):
        if not v or not str(v).strip():
            raise ValueError('Field cannot be empty')
        return str(v).strip()


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
    try:
        # Test service initialization
        scanner_test = get_scanner()
        fixer_test = get_auto_fixer()
        
        return {
            "status": "healthy",
            "service": "accessibility-validator",
            "scanner": "initialized",
            "fixer": "initialized"
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "service": "accessibility-validator",
                "error": str(e)
            }
        )


@app.post("/scan-url", response_model=ScanResponse)
async def scan_url(request: ScanURLRequest):
    """
    Scan a website URL for accessibility issues
    
    Input: Website URL
    Output: Structured JSON report of issues
    """
    try:
        url = str(request.url).strip()
        
        # Validate URL
        if not url:
            raise HTTPException(status_code=400, detail="URL cannot be empty")
            
        # Add protocol if missing
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
            
        logger.info(f"Starting URL scan for: {url}")
        
        # Get scanner instance
        try:
            scanner_instance = get_scanner()
        except Exception as e:
            logger.error(f"Failed to initialize scanner: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to initialize scanner: {str(e)}")
        
        # Fetch and parse the website
        try:
            html_content, css_content, js_content = await scanner_instance.fetch_website(url)
        except Exception as e:
            logger.error(f"Failed to fetch website: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Failed to fetch website: {str(e)}")
        
        # Run comprehensive accessibility scan
        try:
            issues = await scanner_instance.scan_comprehensive(html_content, css_content, js_content, url)
            
            # Ensure issues is a list
            if not isinstance(issues, list):
                logger.warning(f"Scanner returned non-list issues: {type(issues)}")
                issues = []
        except Exception as e:
            logger.error(f"Error during scan: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"Error during accessibility scan: {str(e)}")
        
        # Calculate score and WCAG level
        try:
            score = scanner_instance.calculate_accessibility_score(issues)
            wcag_level = scanner_instance.determine_wcag_level(issues)
            
            # Ensure score is valid
            if not isinstance(score, (int, float)):
                score = 0.0
            if score < 0:
                score = 0.0
            if score > 100:
                score = 100.0
                
            if not isinstance(wcag_level, str):
                wcag_level = "Unknown"
        except Exception as e:
            logger.warning(f"Error calculating score/WCAG level: {str(e)}")
            score = 0.0
            wcag_level = "Unknown"
        
        logger.info(f"URL scan completed: {len(issues)} issues found")
        
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
        logger.error(f"Unexpected error in scan_url: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error scanning URL: {str(e)}")


@app.post("/scan-html", response_model=ScanResponse)
async def scan_html(request: ScanHTMLRequest):
    """
    Scan raw HTML/CSS/JS for accessibility issues
    
    Input: Raw HTML, optional CSS and JS
    Output: Structured JSON report of issues
    """
    try:
        # Validate input
        if not request.html or not request.html.strip():
            raise HTTPException(status_code=400, detail="HTML content cannot be empty")
        
        logger.info(f"Starting HTML scan for {len(request.html)} characters of HTML")
        
        # Get scanner instance
        try:
            scanner_instance = get_scanner()
        except Exception as e:
            logger.error(f"Failed to initialize scanner: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to initialize scanner: {str(e)}")
        
        # Run comprehensive accessibility scan
        try:
            issues = await scanner_instance.scan_comprehensive(
                request.html,
                request.css or "",
                request.js or "",
                "uploaded-content"
            )
            
            # Ensure issues is a list
            if not isinstance(issues, list):
                logger.warning(f"Scanner returned non-list issues: {type(issues)}")
                issues = []
                
        except Exception as e:
            logger.error(f"Error during scan: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"Error during accessibility scan: {str(e)}")
        
        # Calculate score and WCAG level
        try:
            score = scanner_instance.calculate_accessibility_score(issues)
            wcag_level = scanner_instance.determine_wcag_level(issues)
            
            # Ensure score is a valid number
            if not isinstance(score, (int, float)):
                score = 0.0
            if score < 0:
                score = 0.0
            if score > 100:
                score = 100.0
                
            # Ensure wcag_level is a string
            if not isinstance(wcag_level, str):
                wcag_level = "Unknown"
                
        except Exception as e:
            logger.warning(f"Error calculating score/WCAG level: {str(e)}")
            score = 0.0
            wcag_level = "Unknown"
        
        logger.info(f"Scan completed: {len(issues)} issues found")
        
        return ScanResponse(
            success=True,
            issues=issues,
            total_issues=len(issues),
            wcag_level=wcag_level,
            score=score
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in scan_html: {str(e)}\n{traceback.format_exc()}")
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
        # Validate input
        if not request.original_code or not request.original_code.strip():
            raise HTTPException(status_code=400, detail="Original code cannot be empty")
        if not request.issue_type or not request.issue_type.strip():
            raise HTTPException(status_code=400, detail="Issue type cannot be empty")
            
        logger.info(f"Generating fix for issue type: {request.issue_type}")
        
        # Get fixer instance
        try:
            fixer_instance = get_auto_fixer()
        except Exception as e:
            logger.error(f"Failed to initialize auto-fixer: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to initialize auto-fixer: {str(e)}")
        
        # Generate fix
        try:
            fix_result = await fixer_instance.generate_fix(
                issue_type=request.issue_type,
                element_selector=request.element_selector,
                original_code=request.original_code,
                issue_id=request.issue_id
            )
            
            # Validate fix_result structure
            if not isinstance(fix_result, dict):
                raise ValueError("Fix result must be a dictionary")
                
            if "fixed_code" not in fix_result:
                logger.warning("Fix result missing 'fixed_code', using original code")
                fix_result["fixed_code"] = request.original_code
                
            if "explanation" not in fix_result:
                logger.warning("Fix result missing 'explanation', using default")
                fix_result["explanation"] = "Fix applied for accessibility improvement."
                
            # Ensure fixed_code is not empty
            if not fix_result["fixed_code"] or not str(fix_result["fixed_code"]).strip():
                logger.warning("Fix result has empty fixed_code, using original")
                fix_result["fixed_code"] = request.original_code
                
        except Exception as e:
            logger.error(f"Error generating fix: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"Error generating fix: {str(e)}")
        
        logger.info(f"Fix generated successfully for issue: {request.issue_id}")
        
        return FixResponse(
            success=True,
            fixed_code=str(fix_result["fixed_code"]),
            explanation=str(fix_result["explanation"]),
            before_code=request.original_code,
            after_code=str(fix_result["fixed_code"])
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in auto_fix_issue: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error generating fix: {str(e)}")


@app.post("/batch-fix")
async def batch_fix_issues(issues: List[FixRequest]):
    """
    Generate fixes for multiple issues at once
    
    Input: List of issue fix requests
    Output: List of fix responses
    """
    try:
        if not issues or len(issues) == 0:
            raise HTTPException(status_code=400, detail="Issues list cannot be empty")
            
        logger.info(f"Starting batch fix for {len(issues)} issues")
        
        results = []
        fixer_instance = get_auto_fixer()
        
        for issue in issues:
            try:
                fix_result = await fixer_instance.generate_fix(
                    issue_type=issue.issue_type,
                    element_selector=issue.element_selector,
                    original_code=issue.original_code,
                    issue_id=issue.issue_id
                )
                
                # Validate fix_result
                if not isinstance(fix_result, dict):
                    results.append({
                        "issue_id": issue.issue_id,
                        "success": False,
                        "error": "Invalid fix result format"
                    })
                    continue
                    
                if "fixed_code" not in fix_result:
                    fix_result["fixed_code"] = issue.original_code
                if "explanation" not in fix_result:
                    fix_result["explanation"] = "Fix applied for accessibility improvement."
                
                results.append({
                    "issue_id": issue.issue_id,
                    "success": True,
                    "fixed_code": str(fix_result["fixed_code"]),
                    "explanation": str(fix_result["explanation"])
                })
            except Exception as e:
                logger.error(f"Error fixing issue {issue.issue_id}: {str(e)}")
                results.append({
                    "issue_id": issue.issue_id,
                    "success": False,
                    "error": str(e)
                })
        
        logger.info(f"Batch fix completed: {len([r for r in results if r.get('success')])} successful")
        
        return {"success": True, "fixes": results}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in batch_fix_issues: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error batch fixing: {str(e)}")


@app.get("/wcag-rules")
async def get_wcag_rules():
    """Get list of all WCAG 2.2 rules that are being checked"""
    try:
        scanner_instance = get_scanner()
        rules = scanner_instance.get_wcag_rules()
        return {
            "rules": rules if isinstance(rules, list) else [],
            "version": "2.2"
        }
    except Exception as e:
        logger.error(f"Error getting WCAG rules: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving WCAG rules: {str(e)}")


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for unhandled exceptions"""
    logger.error(f"Unhandled exception: {str(exc)}\n{traceback.format_exc()}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc)}
    )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

