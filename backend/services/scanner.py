"""
Accessibility Scanner Service
Scans HTML/CSS/JS for WCAG 2.2 compliance issues
"""

from bs4 import BeautifulSoup
import httpx
from typing import List, Dict, Any, Optional, Tuple
import re
from urllib.parse import urljoin, urlparse
from .contrast_analyzer import ContrastAnalyzer
from .aria_checker import ARIAChecker
from .keyboard_nav import KeyboardNavChecker
from .readability_scorer import ReadabilityScorer


class AccessibilityScanner:
    """Main scanner class that orchestrates all accessibility checks"""
    
    def __init__(self):
        self.contrast_analyzer = ContrastAnalyzer()
        self.aria_checker = ARIAChecker()
        self.keyboard_nav = KeyboardNavChecker()
        self.readability_scorer = ReadabilityScorer()
    
    async def fetch_website(self, url: str) -> Tuple[str, str, str]:
        """
        Fetch website content (HTML, CSS, JS)
        
        Args:
            url: Website URL to fetch
            
        Returns:
            Tuple of (html_content, css_content, js_content)
        """
        try:
            async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
                response = await client.get(url)
                response.raise_for_status()
                html_content = response.text
                
                # Parse HTML to extract CSS and JS
                soup = BeautifulSoup(html_content, 'lxml')
                
                # Extract CSS
                css_links = [link.get('href') for link in soup.find_all('link', rel='stylesheet')]
                css_content = ""
                for css_link in css_links:
                    if css_link:
                        css_url = urljoin(url, css_link)
                        try:
                            css_resp = await client.get(css_url, timeout=10.0)
                            css_content += css_resp.text + "\n"
                        except:
                            pass
                
                # Extract inline styles
                for style_tag in soup.find_all('style'):
                    if style_tag.string:
                        css_content += style_tag.string + "\n"
                
                # Extract JS
                js_content = ""
                for script in soup.find_all('script'):
                    if script.get('src'):
                        js_url = urljoin(url, script.get('src'))
                        try:
                            js_resp = await client.get(js_url, timeout=10.0)
                            js_content += js_resp.text + "\n"
                        except:
                            pass
                    elif script.string:
                        js_content += script.string + "\n"
                
                return html_content, css_content, js_content
        except Exception as e:
            raise Exception(f"Failed to fetch website: {str(e)}")
    
    async def scan_comprehensive(
        self,
        html: str,
        css: str,
        js: str,
        source_url: str
    ) -> List[Dict[str, Any]]:
        """
        Run comprehensive accessibility scan
        
        Args:
            html: HTML content
            css: CSS content
            js: JavaScript content
            source_url: Source URL or identifier
            
        Returns:
            List of accessibility issues found
        """
        issues = []
        soup = BeautifulSoup(html, 'lxml')
        
        # 1. Check for missing alt text
        issues.extend(await self._check_missing_alt_text(soup, source_url))
        
        # 2. Check color contrast
        issues.extend(await self._check_contrast(soup, css, source_url))
        
        # 3. Check ARIA attributes
        issues.extend(await self._check_aria(soup, source_url))
        
        # 4. Check keyboard navigation
        issues.extend(await self._check_keyboard_navigation(soup, js, source_url))
        
        # 5. Check semantic HTML
        issues.extend(await self._check_semantic_html(soup, source_url))
        
        # 6. Check form labels
        issues.extend(await self._check_form_labels(soup, source_url))
        
        # 7. Check heading hierarchy
        issues.extend(await self._check_heading_hierarchy(soup, source_url))
        
        # 8. Check text readability
        issues.extend(await self._check_readability(soup, source_url))
        
        # 9. Check focus indicators
        issues.extend(await self._check_focus_indicators(css, source_url))
        
        # 10. Check language attribute
        issues.extend(await self._check_language_attribute(soup, source_url))
        
        return issues
    
    async def _check_missing_alt_text(
        self,
        soup: BeautifulSoup,
        source_url: str
    ) -> List[Dict[str, Any]]:
        """Check for images without alt text"""
        issues = []
        
        for img in soup.find_all('img'):
            alt = img.get('alt')
            
            # Empty alt is OK for decorative images, but missing alt is not
            if alt is None:
                issues.append({
                    "id": f"alt-missing-{len(issues)}",
                    "type": "missing_alt_text",
                    "severity": "high",
                    "wcag_level": "A",
                    "wcag_rule": "1.1.1",
                    "element": str(img),
                    "selector": self._generate_selector(img),
                    "message": "Image missing alt attribute",
                    "description": "Images must have an alt attribute to provide text alternatives for screen readers.",
                    "fix_suggestion": "Add alt attribute with descriptive text",
                    "source_url": source_url
                })
            elif alt == "" and img.get('role') != 'presentation' and img.get('aria-hidden') != 'true':
                # Empty alt might be OK, but warn if not marked as decorative
                issues.append({
                    "id": f"alt-empty-{len(issues)}",
                    "type": "empty_alt_text",
                    "severity": "medium",
                    "wcag_level": "A",
                    "wcag_rule": "1.1.1",
                    "element": str(img),
                    "selector": self._generate_selector(img),
                    "message": "Image has empty alt attribute - ensure it's decorative or add description",
                    "description": "Empty alt text should only be used for decorative images. If the image conveys information, add descriptive alt text.",
                    "fix_suggestion": "Add descriptive alt text or mark image as decorative with role='presentation'",
                    "source_url": source_url
                })
        
        return issues
    
    async def _check_contrast(
        self,
        soup: BeautifulSoup,
        css: str,
        source_url: str
    ) -> List[Dict[str, Any]]:
        """Check color contrast ratios"""
        issues = []
        
        # Extract text elements and their styles
        text_elements = soup.find_all(['p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'button', 'label'])
        
        for element in text_elements:
            # Skip if element has no visible text
            text = element.get_text(strip=True)
            if not text:
                continue
            
            # Check inline styles and CSS for color
            inline_style = element.get('style', '')
            bg_color, text_color = self.contrast_analyzer.extract_colors(inline_style, css, element)
            
            if bg_color and text_color:
                ratio = self.contrast_analyzer.calculate_contrast_ratio(text_color, bg_color)
                
                # Check WCAG requirements
                is_large_text = self.contrast_analyzer.is_large_text(element)
                required_ratio_aa = 3.0 if is_large_text else 4.5
                required_ratio_aaa = 4.5 if is_large_text else 7.0
                
                if ratio < required_ratio_aa:
                    issues.append({
                        "id": f"contrast-{len(issues)}",
                        "type": "contrast_ratio",
                        "severity": "high",
                        "wcag_level": "AA",
                        "wcag_rule": "1.4.3",
                        "element": str(element)[:200],
                        "selector": self._generate_selector(element),
                        "message": f"Color contrast ratio {ratio:.2f}:1 is below WCAG AA standard ({required_ratio_aa}:1)",
                        "description": f"Text color ({text_color}) and background color ({bg_color}) have insufficient contrast for readability.",
                        "current_ratio": ratio,
                        "required_ratio": required_ratio_aa,
                        "text_color": text_color,
                        "bg_color": bg_color,
                        "fix_suggestion": "Adjust colors to meet contrast requirements",
                        "source_url": source_url
                    })
        
        return issues
    
    async def _check_aria(
        self,
        soup: BeautifulSoup,
        source_url: str
    ) -> List[Dict[str, Any]]:
        """Check ARIA attribute usage"""
        issues = []
        
        # Check for ARIA issues using the ARIA checker
        aria_issues = self.aria_checker.check_all(soup)
        
        for issue in aria_issues:
            issues.append({
                "id": f"aria-{len(issues)}",
                "type": issue["type"],
                "severity": issue.get("severity", "medium"),
                "wcag_level": issue.get("wcag_level", "A"),
                "wcag_rule": issue.get("wcag_rule", "4.1.2"),
                "element": issue.get("element", ""),
                "selector": issue.get("selector", ""),
                "message": issue["message"],
                "description": issue.get("description", ""),
                "fix_suggestion": issue.get("fix_suggestion", ""),
                "source_url": source_url
            })
        
        return issues
    
    async def _check_keyboard_navigation(
        self,
        soup: BeautifulSoup,
        js: str,
        source_url: str
    ) -> List[Dict[str, Any]]:
        """Check keyboard navigation accessibility"""
        issues = []
        
        # Check interactive elements for keyboard accessibility
        interactive_elements = soup.find_all(['a', 'button', 'input', 'select', 'textarea'])
        
        for element in interactive_elements:
            # Check if element has tabindex
            tabindex = element.get('tabindex')
            
            # Check for tabindex="-1" which removes from tab order (might be intentional)
            if tabindex == "-1" and element.name == 'a':
                # Links shouldn't be removed from keyboard navigation unless necessary
                href = element.get('href')
                if href and href != "#" and href != "javascript:void(0)":
                    issues.append({
                        "id": f"keyboard-{len(issues)}",
                        "type": "keyboard_navigation",
                        "severity": "high",
                        "wcag_level": "A",
                        "wcag_rule": "2.1.1",
                        "element": str(element)[:200],
                        "selector": self._generate_selector(element),
                        "message": "Link removed from keyboard navigation with tabindex='-1'",
                        "description": "All interactive elements should be keyboard accessible. Removing links from tab order can exclude keyboard users.",
                        "fix_suggestion": "Remove tabindex='-1' or provide alternative keyboard access",
                        "source_url": source_url
                    })
            
            # Check for elements that need but lack keyboard event handlers in JS
            element_id = element.get('id')
            if element_id and js:
                if 'onclick' in element.attrs and not any(key in js.lower() for key in ['keydown', 'keyup', 'keypress']):
                    # Check if there's a keyboard handler for this element
                    if element_id.lower() not in js.lower():
                        issues.append({
                            "id": f"keyboard-{len(issues)}",
                            "type": "keyboard_navigation",
                            "severity": "medium",
                            "wcag_level": "A",
                            "wcag_rule": "2.1.1",
                            "element": str(element)[:200],
                            "selector": self._generate_selector(element),
                            "message": "Interactive element may not have keyboard support",
                            "description": "Elements with click handlers should also support keyboard activation.",
                            "fix_suggestion": "Add keyboard event handlers (keydown/keypress with Enter/Space)",
                            "source_url": source_url
                        })
        
        return issues
    
    async def _check_semantic_html(
        self,
        soup: BeautifulSoup,
        source_url: str
    ) -> List[Dict[str, Any]]:
        """Check for proper semantic HTML usage"""
        issues = []
        
        # Check for div/span buttons instead of actual button elements
        for div in soup.find_all(['div', 'span']):
            if div.get('onclick') or div.get('role') == 'button':
                if div.name != 'button':
                    issues.append({
                        "id": f"semantic-{len(issues)}",
                        "type": "semantic_html",
                        "severity": "medium",
                        "wcag_level": "A",
                        "wcag_rule": "4.1.2",
                        "element": str(div)[:200],
                        "selector": self._generate_selector(div),
                        "message": f"Using {div.name} as button - use semantic <button> element",
                        "description": "Use semantic HTML elements for better accessibility. Screen readers can better identify interactive elements.",
                        "fix_suggestion": "Replace with <button> element",
                        "source_url": source_url
                    })
        
        return issues
    
    async def _check_form_labels(
        self,
        soup: BeautifulSoup,
        source_url: str
    ) -> List[Dict[str, Any]]:
        """Check form inputs have associated labels"""
        issues = []
        
        inputs = soup.find_all(['input', 'select', 'textarea'])
        
        for input_elem in inputs:
            input_id = input_elem.get('id')
            input_name = input_elem.get('name')
            input_type = input_elem.get('type', 'text')
            
            # Skip hidden inputs
            if input_type == 'hidden':
                continue
            
            # Check for label
            has_label = False
            
            if input_id:
                # Check for <label for="id">
                label = soup.find('label', {'for': input_id})
                if label:
                    has_label = True
                else:
                    # Check for wrapping label
                    parent = input_elem.find_parent('label')
                    if parent:
                        has_label = True
            
            # Check for aria-label
            if not has_label and input_elem.get('aria-label'):
                has_label = True
            
            # Check for aria-labelledby
            if not has_label and input_elem.get('aria-labelledby'):
                has_label = True
            
            # Check for placeholder (not sufficient for accessibility)
            if not has_label:
                if input_elem.get('placeholder'):
                    issues.append({
                        "id": f"form-{len(issues)}",
                        "type": "missing_label",
                        "severity": "high",
                        "wcag_level": "A",
                        "wcag_rule": "1.3.1",
                        "element": str(input_elem)[:200],
                        "selector": self._generate_selector(input_elem),
                        "message": "Form input missing proper label",
                        "description": "Form inputs must have associated labels for screen reader users. Placeholder text is not sufficient.",
                        "fix_suggestion": "Add <label> element or aria-label/aria-labelledby attribute",
                        "source_url": source_url
                    })
                else:
                    issues.append({
                        "id": f"form-{len(issues)}",
                        "type": "missing_label",
                        "severity": "high",
                        "wcag_level": "A",
                        "wcag_rule": "1.3.1",
                        "element": str(input_elem)[:200],
                        "selector": self._generate_selector(input_elem),
                        "message": "Form input missing label",
                        "description": "All form inputs must have associated labels for accessibility.",
                        "fix_suggestion": "Add <label> element or aria-label/aria-labelledby attribute",
                        "source_url": source_url
                    })
        
        return issues
    
    async def _check_heading_hierarchy(
        self,
        soup: BeautifulSoup,
        source_url: str
    ) -> List[Dict[str, Any]]:
        """Check heading hierarchy is logical (h1, h2, h3, etc.)"""
        issues = []
        
        headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        
        if not headings:
            issues.append({
                "id": f"heading-{len(issues)}",
                "type": "missing_headings",
                "severity": "medium",
                "wcag_level": "AA",
                "wcag_rule": "1.3.1",
                "element": "",
                "selector": "",
                "message": "Page missing heading structure",
                "description": "Headings help screen reader users navigate the page structure.",
                "fix_suggestion": "Add heading elements (h1-h6) to structure content",
                "source_url": source_url
            })
            return issues
        
        previous_level = 0
        
        for heading in headings:
            level = int(heading.name[1])
            
            # Check for skipping levels (e.g., h1 to h3)
            if previous_level > 0 and level > previous_level + 1:
                issues.append({
                    "id": f"heading-{len(issues)}",
                    "type": "heading_hierarchy",
                    "severity": "medium",
                    "wcag_level": "AA",
                    "wcag_rule": "1.3.1",
                    "element": str(heading)[:200],
                    "selector": self._generate_selector(heading),
                    "message": f"Heading level jumps from h{previous_level} to h{level}",
                    "description": "Heading hierarchy should not skip levels. This confuses screen reader users navigating by headings.",
                    "fix_suggestion": f"Use h{previous_level + 1} or adjust heading structure",
                    "source_url": source_url
                })
            
            previous_level = level
        
        return issues
    
    async def _check_readability(
        self,
        soup: BeautifulSoup,
        source_url: str
    ) -> List[Dict[str, Any]]:
        """Check text readability using NLP scoring"""
        issues = []
        
        # Extract main text content (excluding nav, footer, etc.)
        main_content = soup.find('main') or soup.find('article') or soup.find('body')
        if not main_content:
            return issues
        
        text_content = main_content.get_text(separator=' ', strip=True)
        
        if text_content:
            readability_score = self.readability_scorer.score(text_content)
            
            # Check if text is too complex
            if readability_score < 50:  # Flesch Reading Ease below 50 is difficult
                issues.append({
                    "id": f"readability-{len(issues)}",
                    "type": "readability",
                    "severity": "low",
                    "wcag_level": "AAA",
                    "wcag_rule": "3.1.5",
                    "element": "",
                    "selector": "main content",
                    "message": "Text may be too complex for general audience",
                    "description": f"Readability score: {readability_score:.1f}. Consider simplifying language for better comprehension.",
                    "readability_score": readability_score,
                    "fix_suggestion": "Simplify sentence structure and vocabulary",
                    "source_url": source_url
                })
        
        return issues
    
    async def _check_focus_indicators(
        self,
        css: str,
        source_url: str
    ) -> List[Dict[str, Any]]:
        """Check for focus indicators in CSS"""
        issues = []
        
        # Check if focus styles are defined
        if css:
            # Look for :focus, :focus-visible, or outline styles
            focus_patterns = [
                r':focus\s*\{[^}]*\}',
                r':focus-visible\s*\{[^}]*\}',
                r'outline\s*:',
                r'outline:\s*none',
                r'outline:\s*0'
            ]
            
            has_focus_style = False
            has_outline_none = False
            
            for pattern in focus_patterns:
                matches = re.findall(pattern, css, re.IGNORECASE)
                if matches:
                    if 'outline' in pattern.lower() and ('none' in str(matches).lower() or '0' in str(matches)):
                        has_outline_none = True
                    else:
                        has_focus_style = True
            
            if has_outline_none and not has_focus_style:
                issues.append({
                    "id": f"focus-{len(issues)}",
                    "type": "focus_indicator",
                    "severity": "high",
                    "wcag_level": "AA",
                    "wcag_rule": "2.4.7",
                    "element": "",
                    "selector": "interactive elements",
                    "message": "Focus indicators removed without replacement",
                    "description": "Removing outline without adding custom focus styles makes keyboard navigation difficult.",
                    "fix_suggestion": "Add visible focus styles (border, box-shadow, or outline)",
                    "source_url": source_url
                })
            elif not has_focus_style:
                issues.append({
                    "id": f"focus-{len(issues)}",
                    "type": "focus_indicator",
                    "severity": "medium",
                    "wcag_level": "AA",
                    "wcag_rule": "2.4.7",
                    "element": "",
                    "selector": "interactive elements",
                    "message": "Custom focus indicators recommended",
                    "description": "While default browser focus indicators exist, custom visible focus styles improve accessibility.",
                    "fix_suggestion": "Add :focus and :focus-visible styles",
                    "source_url": source_url
                })
        
        return issues
    
    async def _check_language_attribute(
        self,
        soup: BeautifulSoup,
        source_url: str
    ) -> List[Dict[str, Any]]:
        """Check html element has lang attribute"""
        issues = []
        
        html_tag = soup.find('html')
        if not html_tag or not html_tag.get('lang'):
            issues.append({
                "id": f"language-{len(issues)}",
                "type": "missing_lang",
                "severity": "high",
                "wcag_level": "A",
                "wcag_rule": "3.1.1",
                "element": str(html_tag) if html_tag else "<html>",
                "selector": "html",
                "message": "HTML element missing lang attribute",
                "description": "The lang attribute helps screen readers pronounce content correctly and search engines understand the language.",
                "fix_suggestion": 'Add lang attribute to <html> tag (e.g., <html lang="en">)',
                "source_url": source_url
            })
        
        return issues
    
    def _generate_selector(self, element) -> str:
        """Generate CSS selector for an element"""
        try:
            # Try ID first
            if element.get('id'):
                return f"#{element.get('id')}"
            
            # Try class
            if element.get('class'):
                classes = ' '.join(element.get('class'))
                return f".{classes.split()[0]}"
            
            # Use tag name
            return element.name or "unknown"
        except:
            return "unknown"
    
    def calculate_accessibility_score(self, issues: List[Dict[str, Any]]) -> float:
        """Calculate accessibility score (0-100)"""
        if not issues:
            return 100.0
        
        # Weight by severity
        severity_weights = {
            "high": 5,
            "medium": 3,
            "low": 1
        }
        
        total_weight = sum(severity_weights.get(issue.get("severity", "medium"), 3) for issue in issues)
        max_weight = len(issues) * 5  # All high severity
        
        score = max(0, 100 - (total_weight / max_weight * 100))
        return round(score, 2)
    
    def determine_wcag_level(self, issues: List[Dict[str, Any]]) -> str:
        """Determine WCAG compliance level"""
        aa_issues = [i for i in issues if i.get("severity") == "high" and i.get("wcag_level") in ["A", "AA"]]
        aaa_issues = [i for i in issues if i.get("wcag_level") == "AAA"]
        
        if not issues:
            return "AAA"
        elif not aa_issues:
            return "AA"
        elif len(aa_issues) <= 3:
            return "A"
        else:
            return "Non-compliant"
    
    def get_wcag_rules(self) -> List[Dict[str, str]]:
        """Get list of WCAG 2.2 rules being checked"""
        return [
            {"rule": "1.1.1", "level": "A", "description": "Non-text Content - Images must have alt text"},
            {"rule": "1.3.1", "level": "A", "description": "Info and Relationships - Proper heading hierarchy and form labels"},
            {"rule": "1.4.3", "level": "AA", "description": "Contrast (Minimum) - Text contrast ratio of at least 4.5:1"},
            {"rule": "2.1.1", "level": "A", "description": "Keyboard - All functionality must be keyboard accessible"},
            {"rule": "2.4.7", "level": "AA", "description": "Focus Visible - Keyboard focus must be visible"},
            {"rule": "3.1.1", "level": "A", "description": "Language of Page - HTML must have lang attribute"},
            {"rule": "3.1.5", "level": "AAA", "description": "Reading Level - Text should be simple enough"},
            {"rule": "4.1.2", "level": "A", "description": "Name, Role, Value - Proper ARIA usage and semantic HTML"}
        ]

