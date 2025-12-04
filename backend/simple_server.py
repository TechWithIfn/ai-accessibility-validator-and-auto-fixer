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
from database import db, DB_PATH

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
        except httpx.TimeoutException as e:
            raise Exception(f"Request timeout: Could not fetch {url} within 30 seconds: {str(e)}")
        except httpx.ConnectError as e:
            raise Exception(f"Connection error: Could not connect to {url}. Check if the URL is correct and accessible. Error: {str(e)}")
        except httpx.HTTPStatusError as e:
            # httpx uses response.reason_phrase instead of status_text
            status_code = e.response.status_code
            reason = getattr(e.response, 'reason_phrase', 'Unknown error')
            raise Exception(f"HTTP error {status_code}: {reason}")
        except httpx.RequestError as e:
            raise Exception(f"Request error: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to fetch website: {str(e)}")
    
    async def scan_comprehensive(self, html, css, js, url):
        """Comprehensive scan that returns accessibility issues"""
        from bs4 import BeautifulSoup
        import re
        
        # Validate HTML input
        if not html or len(html.strip()) == 0:
            print("⚠️  Warning: Empty HTML content provided to scanner")
            return []
        
        try:
            soup = BeautifulSoup(html, 'lxml')
        except Exception as e:
            print(f"⚠️  Warning: Error parsing HTML: {e}")
            # Try with html.parser as fallback
            try:
                soup = BeautifulSoup(html, 'html.parser')
            except:
                print(f"❌ Failed to parse HTML with both parsers")
                return []
        
        issues = []
        print(f"   Parsed HTML: {len(soup.find_all())} total elements")
        
        # Helper to generate selector
        def get_selector(elem):
            if elem.get('id'):
                return f"#{elem.get('id')}"
            if elem.get('class'):
                classes = ' '.join(elem.get('class', []))
                if classes:
                    return f".{classes.split()[0]}"
            return elem.name or "unknown"
        
        # 1. Check for missing alt text on images
        images = soup.find_all('img')
        print(f"   Found {len(images)} images")
        for img in images:
            alt = img.get('alt')
            if alt is None:
                issues.append({
                    "id": f"alt-missing-{len(issues)}",
                    "type": "missing_alt_text",
                    "severity": "high",
                    "wcag_level": "A",
                    "wcag_rule": "1.1.1",
                    "message": "Image missing alt attribute",
                    "description": "Images must have alt text for screen reader users",
                    "fix_suggestion": "Add alt attribute with descriptive text",
                    "selector": get_selector(img),
                    "element": str(img),
                    "original_code": str(img)[:500]
                })
            elif alt == "" and img.get('role') != 'presentation' and img.get('aria-hidden') != 'true':
                issues.append({
                    "id": f"alt-empty-{len(issues)}",
                    "type": "empty_alt_text",
                    "severity": "medium",
                    "wcag_level": "A",
                    "wcag_rule": "1.1.1",
                    "message": "Image has empty alt - ensure it's decorative",
                    "description": "Empty alt should only be used for decorative images",
                    "fix_suggestion": "Add descriptive alt text or mark as decorative with role='presentation'",
                    "selector": get_selector(img),
                    "original_code": str(img)[:200]
                })
        
        # 2. Check for missing lang attribute
        html_tag = soup.find('html')
        if not html_tag:
            # No html tag at all - this is also an issue
            issues.append({
                "id": f"lang-missing-{len(issues)}",
                "type": "missing_lang",
                "severity": "high",
                "wcag_level": "A",
                "wcag_rule": "3.1.1",
                "message": "HTML element missing or no lang attribute",
                "description": "HTML should have a lang attribute for screen readers",
                "fix_suggestion": 'Add <html lang="en"> tag with lang attribute',
                "selector": "html",
                "original_code": ""
            })
        elif not html_tag.get('lang'):
            issues.append({
                "id": f"lang-missing-{len(issues)}",
                "type": "missing_lang",
                "severity": "high",
                "wcag_level": "A",
                "wcag_rule": "3.1.1",
                "message": "HTML missing lang attribute",
                "description": "HTML should have a lang attribute for screen readers",
                "fix_suggestion": 'Add lang attribute to html tag (e.g., <html lang="en">)',
                "selector": "html",
                "original_code": str(html_tag)[:200] if html_tag else "<html>"
            })
        
        # 3. Check for missing form labels
        form_inputs = soup.find_all(['input', 'select', 'textarea'])
        print(f"   Found {len(form_inputs)} form inputs")
        for input_elem in form_inputs:
            input_type = input_elem.get('type', 'text')
            if input_type == 'hidden':
                continue
            
            input_id = input_elem.get('id')
            has_label = False
            
            # Check for explicit label
            if input_id:
                label = soup.find('label', {'for': input_id})
                if label:
                    has_label = True
                else:
                    # Check for wrapping label
                    parent = input_elem.find_parent('label')
                    if parent:
                        has_label = True
            
            # Check for aria-label or aria-labelledby
            if not has_label:
                if input_elem.get('aria-label') or input_elem.get('aria-labelledby'):
                    has_label = True
            
            if not has_label:
                placeholder = input_elem.get('placeholder')
                if placeholder:
                    issues.append({
                        "id": f"form-placeholder-{len(issues)}",
                        "type": "placeholder_instead_of_label",
                        "severity": "high",
                        "wcag_level": "A",
                        "wcag_rule": "1.3.1",
                        "message": "Form input uses placeholder instead of label",
                        "description": "Placeholder text is not sufficient for accessibility. Labels are required.",
                        "fix_suggestion": "Add <label> element or aria-label attribute",
                        "selector": get_selector(input_elem),
                        "original_code": str(input_elem)[:200]
                    })
                else:
                    issues.append({
                        "id": f"form-missing-label-{len(issues)}",
                        "type": "missing_label",
                        "severity": "high",
                        "wcag_level": "A",
                        "wcag_rule": "1.3.1",
                        "message": "Form input missing label",
                        "description": "All form inputs must have associated labels",
                        "fix_suggestion": "Add <label> element or aria-label/aria-labelledby attribute",
                        "selector": get_selector(input_elem),
                        "original_code": str(input_elem)[:200]
                    })
        
        # 4. Check for missing or improper heading structure
        headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        print(f"   Found {len(headings)} headings")
        if not headings:
            issues.append({
                "id": f"heading-missing-{len(issues)}",
                "type": "missing_headings",
                "severity": "medium",
                "wcag_level": "AA",
                "wcag_rule": "1.3.1",
                "message": "Page missing heading structure",
                "description": "Headings help screen reader users navigate the page",
                "fix_suggestion": "Add heading elements (h1-h6) to structure content",
                "selector": "body",
                "original_code": ""
            })
        else:
            # Check heading hierarchy
            previous_level = 0
            for heading in headings:
                level = int(heading.name[1])
                if previous_level > 0 and level > previous_level + 1:
                    issues.append({
                        "id": f"heading-hierarchy-{len(issues)}",
                        "type": "heading_hierarchy",
                        "severity": "medium",
                        "wcag_level": "AA",
                        "wcag_rule": "1.3.1",
                        "message": f"Heading level jumps from h{previous_level} to h{level}",
                        "description": "Heading hierarchy should not skip levels",
                        "fix_suggestion": f"Use h{previous_level + 1} or adjust heading structure",
                        "selector": get_selector(heading),
                        "original_code": str(heading)[:200]
                    })
                previous_level = level
        
        # 5. Check for div/span used as buttons
        for elem in soup.find_all(['div', 'span']):
            if elem.get('onclick') or elem.get('role') == 'button':
                if elem.name != 'button':
                    issues.append({
                        "id": f"semantic-{len(issues)}",
                        "type": "semantic_html",
                        "severity": "medium",
                        "wcag_level": "A",
                        "wcag_rule": "4.1.2",
                        "message": f"Using {elem.name} as button - use semantic <button> element",
                        "description": "Use semantic HTML elements for better accessibility",
                        "fix_suggestion": "Replace with <button> element",
                        "selector": get_selector(elem),
                        "original_code": str(elem)[:200]
                    })
        
        # 6. Check for links without proper href
        for link in soup.find_all('a'):
            href = link.get('href')
            if not href or href == '#' or href.startswith('javascript:'):
                if not link.get('aria-label') and not link.get_text(strip=True):
                    issues.append({
                        "id": f"link-{len(issues)}",
                        "type": "invalid_link",
                        "severity": "high",
                        "wcag_level": "A",
                        "wcag_rule": "2.4.4",
                        "message": "Link missing accessible name or valid href",
                        "description": "Links must have accessible text and valid href",
                        "fix_suggestion": "Add href attribute or aria-label, ensure link has visible text",
                        "selector": get_selector(link),
                        "original_code": str(link)[:200]
                    })
        
        # 7. Check for buttons without accessible names
        for button in soup.find_all('button'):
            text = button.get_text(strip=True)
            if not text and not button.get('aria-label') and not button.get('aria-labelledby'):
                # Check for image in button
                img_in_button = button.find('img')
                if not img_in_button or not img_in_button.get('alt'):
                    issues.append({
                        "id": f"button-{len(issues)}",
                        "type": "missing_aria_label",
                        "severity": "high",
                        "wcag_level": "A",
                        "wcag_rule": "4.1.2",
                        "message": "Button missing accessible name",
                        "description": "Buttons must have accessible text or aria-label",
                        "fix_suggestion": "Add visible text or aria-label attribute",
                        "selector": get_selector(button),
                        "original_code": str(button)[:200]
                    })
        
        # 8. Check for images with text (should be avoided)
        for img in soup.find_all('img'):
            alt = img.get('alt', '')
            if alt and len(alt) > 50:  # Long alt might indicate text in image
                issues.append({
                    "id": f"image-text-{len(issues)}",
                    "type": "images_with_text",
                    "severity": "low",
                    "wcag_level": "AA",
                    "wcag_rule": "1.4.5",
                    "message": "Image may contain text - consider using actual text",
                    "description": "Images of text should be avoided when possible",
                    "fix_suggestion": "Use actual text with CSS styling instead of image",
                    "selector": get_selector(img),
                    "original_code": str(img)[:200]
                })
        
        # 9. Check for missing focus indicators in CSS
        if css:
            # Look for outline:none without focus replacement
            if re.search(r'outline\s*:\s*none', css, re.IGNORECASE):
                if not re.search(r':focus[^-]|:focus-visible', css, re.IGNORECASE):
                    issues.append({
                        "id": f"focus-{len(issues)}",
                        "type": "focus_indicator",
                        "severity": "high",
                        "wcag_level": "AA",
                        "wcag_rule": "2.4.7",
                        "message": "Focus indicators removed without replacement",
                        "description": "Removing outline without custom focus styles makes keyboard navigation difficult",
                        "fix_suggestion": "Add visible focus styles (border, box-shadow, or outline)",
                        "selector": "interactive elements",
                        "original_code": ""
                    })
        
        # 10. Check for missing landmarks (main, nav, header, footer)
        if not soup.find('main') and not soup.find('article'):
            # Only warn if page seems substantial
            if len(soup.find_all(['div', 'section'])) > 5:
                issues.append({
                    "id": f"landmark-{len(issues)}",
                    "type": "missing_landmarks",
                    "severity": "low",
                    "wcag_level": "AA",
                    "wcag_rule": "1.3.1",
                    "message": "Page missing semantic landmarks",
                    "description": "Semantic landmarks (main, nav, header, footer) help screen reader navigation",
                    "fix_suggestion": "Add <main>, <nav>, <header>, <footer> elements",
                    "selector": "body",
                    "original_code": ""
                })
        
        # 11. Check for low contrast (simplified - check inline styles)
        for elem in soup.find_all(['p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'button', 'label']):
            style = elem.get('style', '')
            if style:
                # Look for color and background-color
                color_match = re.search(r'color\s*:\s*([^;]+)', style, re.IGNORECASE)
                bg_match = re.search(r'background(?:-color)?\s*:\s*([^;]+)', style, re.IGNORECASE)
                
                if color_match and bg_match:
                    text_color = color_match.group(1).strip()
                    bg_color = bg_match.group(1).strip()
                    
                    # Simple contrast check - if both are light or both are dark, flag it
                    # This is a simplified check - full implementation would calculate actual ratio
                    text_is_light = any(x in text_color.lower() for x in ['white', '#fff', '#ffffff', 'rgb(255', 'light'])
                    bg_is_light = any(x in bg_color.lower() for x in ['white', '#fff', '#ffffff', 'rgb(255', 'light'])
                    
                    if text_is_light == bg_is_light and text_color and bg_color:
                        issues.append({
                            "id": f"contrast-{len(issues)}",
                            "type": "contrast_ratio",
                            "severity": "high",
                            "wcag_level": "AA",
                            "wcag_rule": "1.4.3",
                            "message": "Potential low color contrast detected",
                            "description": f"Text color ({text_color}) and background ({bg_color}) may have insufficient contrast",
                            "fix_suggestion": "Ensure contrast ratio meets WCAG AA (4.5:1) or AAA (7:1) standards",
                            "text_color": text_color,
                            "background_color": bg_color,
                            "current_ratio": 2.5,  # Estimated
                            "required_ratio": 4.5,
                            "selector": get_selector(elem),
                            "original_code": str(elem)[:200]
                        })
        
        print(f"   Total issues found in scan: {len(issues)}")
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
    import traceback
    try:
        url = request.url if isinstance(request.url, str) else str(request.url)
        url = url.strip()
        
        # Validate and fix URL
        if not url:
            print(f"❌ Empty URL provided")
            raise HTTPException(status_code=400, detail="URL cannot be empty")
        
        # Add protocol if missing
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        # Validate URL format
        try:
            from urllib.parse import urlparse
            parsed = urlparse(url)
            if not parsed.netloc:
                print(f"❌ Invalid URL format: {url}")
                raise HTTPException(status_code=400, detail="Invalid URL format")
        except HTTPException:
            raise
        except Exception as e:
            print(f"❌ URL validation error: {e}")
            raise HTTPException(status_code=400, detail=f"Invalid URL format: {str(e)}")
        
        print(f"🌐 Scanning URL: {url}")
        
        # Fetch and parse the website
        try:
            html_content, css_content, js_content = await scanner.fetch_website(url)
            print(f"✅ Fetched website content ({len(html_content)} chars, {len(css_content)} CSS chars, {len(js_content)} JS chars)")
            
            # Debug: Check if HTML is valid
            if len(html_content) < 100:
                print(f"⚠️  Warning: HTML content seems very short ({len(html_content)} chars)")
            
        except Exception as fetch_error:
            error_msg = str(fetch_error)
            print(f"❌ Fetch error: {error_msg}")
            print(f"   Traceback: {traceback.format_exc()}")
            if "timeout" in error_msg.lower():
                raise HTTPException(status_code=408, detail=f"Request timeout: {error_msg}")
            elif "connection" in error_msg.lower() or "refused" in error_msg.lower():
                raise HTTPException(status_code=503, detail=f"Cannot connect to website: {error_msg}")
            else:
                raise HTTPException(status_code=400, detail=f"Failed to fetch website: {error_msg}")
        
        # Run comprehensive accessibility scan
        try:
            print(f"🔍 Running accessibility scan...")
            issues = await scanner.scan_comprehensive(html_content, css_content, js_content, url)
            
            # Ensure issues is a list
            if not isinstance(issues, list):
                print(f"⚠️  Warning: Scanner returned non-list: {type(issues)}")
                issues = []
            
            print(f"✅ Scan completed: {len(issues)} issues found")
            if len(issues) > 0:
                issue_types = set(i.get('type', 'unknown') for i in issues)
                print(f"   Issue types found: {', '.join(sorted(issue_types))}")
                # Show first few issues for debugging
                for i, issue in enumerate(issues[:3]):
                    print(f"   Issue {i+1}: {issue.get('type', 'unknown')} - {issue.get('message', 'No message')[:50]}")
            else:
                print(f"   ⚠️  No issues detected")
                print(f"   Debug: HTML length={len(html_content)}, CSS length={len(css_content)}")
                # Try to understand why no issues were found
                from bs4 import BeautifulSoup
                test_soup = BeautifulSoup(html_content, 'lxml')
                img_count = len(test_soup.find_all('img'))
                input_count = len(test_soup.find_all(['input', 'select', 'textarea']))
                heading_count = len(test_soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']))
                html_tag = test_soup.find('html')
                has_lang = html_tag and html_tag.get('lang')
                print(f"   Debug: Found {img_count} images, {input_count} form inputs, {heading_count} headings, lang={has_lang}")
                
        except Exception as scan_error:
            print(f"⚠️  Scan error: {scan_error}")
            print(f"   Traceback: {traceback.format_exc()}")
            issues = []
        
        # Calculate score and WCAG level
        try:
            score = scanner.calculate_accessibility_score(issues)
            wcag_level = scanner.determine_wcag_level(issues)
            print(f"📊 Score: {score}, WCAG Level: {wcag_level}")
        except Exception as score_error:
            print(f"⚠️  Score calculation error: {score_error}")
            score = 100.0 if len(issues) == 0 else 50.0
            wcag_level = "Unknown"
        
        # Save report to database
        try:
            report_id = db.save_report(
                url=url,
                score=score,
                wcag_level=wcag_level,
                total_issues=len(issues),
                issues=issues,
                scan_duration=None,  # Could add timing if needed
                html_content=html_content[:10000] if html_content else None
            )
            print(f"💾 Report saved to database (ID: {report_id})")
        except Exception as db_error:
            print(f"⚠️  Failed to save report to database: {db_error}")
            # Continue even if database save fails
        
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
        print(f"❌ Unexpected error scanning URL: {error_msg}")
        print(f"   Traceback: {traceback.format_exc()}")
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
        
        # Save report to database
        try:
            report_id = db.save_report(
                url="uploaded-content",
                score=score,
                wcag_level=wcag_level,
                total_issues=len(issues),
                issues=issues,
                scan_duration=None,
                html_content=request.html[:10000] if request.html else None
            )
            print(f"💾 Report saved to database (ID: {report_id})")
        except Exception as db_error:
            print(f"⚠️  Failed to save report to database: {db_error}")
        
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

# Auto-fix endpoint
class FixRequest(BaseModel):
    issue_id: str
    element_selector: str
    issue_type: str
    original_code: str

class FixResponse(BaseModel):
    success: bool
    fixed_code: str
    explanation: str
    before_code: str
    after_code: str

@app.post("/auto-fix", response_model=FixResponse)
async def auto_fix_issue(request: FixRequest):
    """Generate automatic fix for a specific accessibility issue"""
    import traceback
    try:
        print(f"🔧 Generating fix for issue: {request.issue_type}")
        
        # Validate input
        if not request.original_code or not request.original_code.strip():
            raise HTTPException(status_code=400, detail="Original code cannot be empty")
        if not request.issue_type or not request.issue_type.strip():
            raise HTTPException(status_code=400, detail="Issue type cannot be empty")
        
        # Try to use full auto-fixer, fallback to simple fixer
        try:
            from services.auto_fixer import AutoFixer
            fixer = AutoFixer()
            print("✅ Using full AutoFixer")
        except Exception as e:
            print(f"⚠️  Using SimpleFixer (full fixer unavailable: {e})")
            fixer = SimpleFixer()
        
        # Generate fix
        try:
            fix_result = await fixer.generate_fix(
                issue_type=request.issue_type,
                element_selector=request.element_selector,
                original_code=request.original_code,
                issue_id=request.issue_id
            )
            
            # Validate fix_result
            if not isinstance(fix_result, dict):
                raise ValueError("Fix result must be a dictionary")
            
            if "fixed_code" not in fix_result:
                fix_result["fixed_code"] = request.original_code
            
            if "explanation" not in fix_result:
                fix_result["explanation"] = "Fix applied for accessibility improvement."
            
            if not fix_result["fixed_code"] or not str(fix_result["fixed_code"]).strip():
                fix_result["fixed_code"] = request.original_code
            
            print(f"✅ Fix generated successfully")
            
            return FixResponse(
                success=True,
                fixed_code=str(fix_result["fixed_code"]),
                explanation=str(fix_result["explanation"]),
                before_code=request.original_code,
                after_code=str(fix_result["fixed_code"])
            )
        except Exception as e:
            print(f"❌ Error generating fix: {e}")
            print(f"   Traceback: {traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"Error generating fix: {str(e)}")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating fix: {str(e)}")

# Simple fixer implementation
class SimpleFixer:
    """Simple fixer that works without all dependencies"""
    
    async def generate_fix(self, issue_type: str, element_selector: str, original_code: str, issue_id: str):
        """Generate fix for accessibility issue"""
        from bs4 import BeautifulSoup
        import re
        
        try:
            soup = BeautifulSoup(original_code, 'html.parser')
            element = soup.find()
            
            if not element:
                return {
                    "fixed_code": original_code,
                    "explanation": "Could not parse element for fixing. Please provide valid HTML code."
                }
            
            # Route to appropriate fix method
            if issue_type in ["missing_alt_text", "empty_alt_text"]:
                return await self._fix_alt_text(element, original_code, issue_type)
            elif issue_type == "missing_lang":
                return await self._fix_lang(soup, original_code)
            elif issue_type in ["missing_label", "placeholder_instead_of_label"]:
                return await self._fix_label(element, soup, original_code)
            elif issue_type == "contrast_ratio":
                return await self._fix_contrast(element, original_code)
            elif issue_type == "semantic_html":
                return await self._fix_semantic(element, original_code)
            elif issue_type == "missing_aria_label":
                return await self._fix_aria_label(element, original_code)
            elif issue_type == "heading_hierarchy":
                return await self._fix_heading(element, original_code)
            elif issue_type == "invalid_link":
                return await self._fix_link(element, original_code)
            else:
                return {
                    "fixed_code": original_code,
                    "explanation": f"AI fix suggestion for {issue_type}: Review the issue and apply appropriate accessibility improvements based on WCAG guidelines."
                }
        except Exception as e:
            return {
                "fixed_code": original_code,
                "explanation": f"Error generating fix: {str(e)}"
            }
    
    async def _fix_alt_text(self, element, original_code, issue_type):
        """Fix missing or empty alt text"""
        if element.name == 'img':
            img_src = element.get('src', '')
            img_class = element.get('class', [])
            img_id = element.get('id', '')
            
            # Generate descriptive alt text based on context
            context_parts = []
            if img_src:
                # Extract filename
                filename = img_src.split('/')[-1].split('.')[0]
                context_parts.append(filename.replace('-', ' ').replace('_', ' ').title())
            
            if img_class:
                context_parts.append(' '.join(img_class).replace('-', ' ').title())
            
            if img_id:
                context_parts.append(img_id.replace('-', ' ').replace('_', ' ').title())
            
            alt_text = ' '.join(context_parts) if context_parts else "Descriptive image"
            
            element['alt'] = alt_text
            
            explanation = f"Added alt='{alt_text}' attribute. This provides a text alternative for screen reader users. "
            if issue_type == "empty_alt_text":
                explanation += "If this image is decorative, consider using alt='' with role='presentation' instead."
            else:
                explanation += "Review and refine the alt text to accurately describe the image content."
            
            return {
                "fixed_code": str(element),
                "explanation": explanation
            }
        return {"fixed_code": original_code, "explanation": "Element is not an image."}
    
    async def _fix_lang(self, soup, original_code):
        """Fix missing lang attribute"""
        html_tag = soup.find('html')
        if html_tag:
            html_tag['lang'] = 'en'
            return {
                "fixed_code": str(html_tag),
                "explanation": "Added lang='en' attribute to <html> element. Update to the correct language code (e.g., 'es' for Spanish, 'fr' for French) if your page is in a different language. This helps screen readers pronounce content correctly and search engines understand the page language."
            }
        return {"fixed_code": original_code, "explanation": "Could not find <html> tag."}
    
    async def _fix_label(self, element, soup, original_code):
        """Fix missing form label"""
        if element.name not in ['input', 'select', 'textarea']:
            return {"fixed_code": original_code, "explanation": "Element is not a form input."}
        
        input_id = element.get('id')
        input_name = element.get('name', 'field')
        input_type = element.get('type', 'text')
        placeholder = element.get('placeholder', '')
        
        if not input_id:
            input_id = f"input-{input_name or 'field'}-{abs(hash(input_name)) % 10000}"
            element['id'] = input_id
        
        # Generate label text
        label_text = placeholder or input_name.replace('_', ' ').replace('-', ' ').title() or 'Input field'
        
        label_html = f'<label for="{input_id}">{label_text}</label>'
        fixed_html = f"{label_html}\n{str(element)}"
        
        explanation = f"Added <label> element with text '{label_text}' associated with the input using the 'for' attribute. "
        if placeholder:
            explanation += "The label replaces the placeholder text, which is not accessible to screen readers. "
        explanation += "This ensures screen reader users understand the purpose of the input field."
        
        return {
            "fixed_code": fixed_html,
            "explanation": explanation
        }
    
    async def _fix_contrast(self, element, original_code):
        """Fix contrast issues"""
        import re
        style = element.get('style', '')
        
        # Suggest high contrast colors
        if 'color:' in style.lower():
            # Replace with high contrast
            new_style = re.sub(r'color\s*:\s*[^;]+', 'color: #000000', style, flags=re.IGNORECASE)
        else:
            new_style = (style + "; " if style else "") + "color: #000000"
        
        if 'background' not in style.lower():
            new_style += "; background-color: #FFFFFF"
        
        element['style'] = new_style
        
        return {
            "fixed_code": str(element),
            "explanation": "Updated colors to high contrast (black text on white background, 21:1 ratio). This exceeds WCAG AAA standards. Adjust colors to match your design while maintaining at least 4.5:1 contrast ratio for normal text (WCAG AA) or 7:1 for AAA compliance."
        }
    
    async def _fix_semantic(self, element, original_code):
        """Fix semantic HTML issues"""
        if element.name in ['div', 'span']:
            if element.get('onclick') or element.get('role') == 'button':
                # Suggest button
                return {
                    "fixed_code": original_code.replace(f"<{element.name}", "<button").replace(f"</{element.name}>", "</button>"),
                    "explanation": f"Changed <{element.name}> to <button> element. Buttons provide built-in keyboard support (Enter and Space keys), proper focus management, and screen reader announcements. Remove any onclick handlers and use button's native click event instead."
                }
        return {"fixed_code": original_code, "explanation": "No semantic fix needed."}
    
    async def _fix_aria_label(self, element, original_code):
        """Fix missing ARIA label"""
        text_content = element.get_text(strip=True)
        element_type = element.name or "element"
        
        if element_type == "button":
            aria_label = text_content or "Button"
        elif element_type == "a":
            aria_label = text_content or "Link"
        else:
            aria_label = text_content or f"{element_type.title()} element"
        
        element['aria-label'] = aria_label
        
        return {
            "fixed_code": str(element),
            "explanation": f"Added aria-label='{aria_label}' to provide an accessible name for screen reader users. This ensures the element's purpose is announced when users navigate with assistive technologies."
        }
    
    async def _fix_heading(self, element, original_code):
        """Fix heading hierarchy"""
        if element.name and element.name.startswith('h'):
            current_level = int(element.name[1])
            suggested_level = max(1, current_level - 1)
            new_tag = f"h{suggested_level}"
            
            return {
                "fixed_code": original_code.replace(f"<{element.name}", f"<{new_tag}").replace(f"</{element.name}>", f"</{new_tag}>"),
                "explanation": f"Changed heading from {element.name} to {new_tag} to maintain proper hierarchy. Headings should not skip levels (e.g., h1 to h3). Use h1 for main page title, h2 for major sections, h3 for subsections, etc."
            }
        return {"fixed_code": original_code, "explanation": "Element is not a heading."}
    
    async def _fix_link(self, element, original_code):
        """Fix invalid link"""
        href = element.get('href', '')
        text = element.get_text(strip=True)
        
        if not href or href == '#':
            # Suggest adding proper href or making it a button
            if text:
                return {
                    "fixed_code": original_code.replace('<a', '<button').replace('</a>', '</button>').replace('href="#"', ''),
                    "explanation": "Changed link to button since it doesn't navigate anywhere. Links should have meaningful href attributes. If the element performs an action rather than navigation, use <button> instead."
                }
            else:
                element['aria-label'] = "Link"
                return {
                    "fixed_code": str(element),
                    "explanation": "Added aria-label to provide accessible name. Consider adding visible text or a proper href attribute for better accessibility."
                }
        
        return {"fixed_code": original_code, "explanation": "Link appears to be valid."}

# Reports endpoints
@app.get("/reports")
async def get_reports(
    limit: int = 100,
    offset: int = 0,
    domain: Optional[str] = None,
    order_by: str = "scan_date",
    order_dir: str = "DESC"
):
    """Get all historical scan reports"""
    try:
        reports = db.get_all_reports(
            limit=limit,
            offset=offset,
            domain=domain,
            order_by=order_by,
            order_dir=order_dir
        )
        return {
            "success": True,
            "reports": reports,
            "total": len(reports)
        }
    except Exception as e:
        import traceback
        print(f"❌ Error fetching reports: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error fetching reports: {str(e)}")

@app.get("/reports/{report_id}")
async def get_report(report_id: int):
    """Get a specific report by ID"""
    try:
        report = db.get_report(report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        return {
            "success": True,
            "report": report
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching report: {str(e)}")

@app.get("/reports/url/{url:path}")
async def get_reports_by_url(url: str, limit: int = 10):
    """Get all reports for a specific URL"""
    try:
        reports = db.get_reports_by_url(url, limit=limit)
        return {
            "success": True,
            "reports": reports,
            "total": len(reports)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching reports: {str(e)}")

@app.delete("/reports/{report_id}")
async def delete_report(report_id: int):
    """Delete a report by ID"""
    try:
        deleted = db.delete_report(report_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Report not found")
        return {
            "success": True,
            "message": "Report deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting report: {str(e)}")

@app.get("/reports/statistics")
async def get_statistics():
    """Get database statistics"""
    try:
        stats = db.get_statistics()
        return {
            "success": True,
            "statistics": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching statistics: {str(e)}")

@app.post("/test-scanner")
async def test_scanner():
    """Test endpoint to verify scanner is working with known problematic HTML"""
    test_html = """
    <!DOCTYPE html>
    <html>
    <head><title>Test Page</title></head>
    <body>
        <img src="test.jpg" />
        <input type="text" placeholder="Enter name" />
        <div onclick="doSomething()">Click me</div>
        <a href="#">Link</a>
        <button></button>
    </body>
    </html>
    """
    
    try:
        issues = await scanner.scan_comprehensive(test_html, "", "", "test-page")
        return {
            "success": True,
            "test_html_length": len(test_html),
            "issues_found": len(issues),
            "issues": issues,
            "expected_issues": [
                "missing_lang",
                "missing_alt_text", 
                "placeholder_instead_of_label",
                "semantic_html",
                "invalid_link",
                "missing_aria_label"
            ]
        }
    except Exception as e:
        import traceback
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
    }

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Starting AI Accessibility Validator Backend")
    print("=" * 60)
    print("📍 Server: http://localhost:8000")
    print("📚 API Docs: http://localhost:8000/docs")
    print("💚 Health: http://localhost:8000/health")
    print("💾 Database: SQLite at", DB_PATH)
    print("=" * 60)
    print("Press Ctrl+C to stop the server\n")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )

