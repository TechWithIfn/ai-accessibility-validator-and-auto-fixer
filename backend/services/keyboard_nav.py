"""
Keyboard Navigation Checker
Validates keyboard accessibility of interactive elements
"""

from bs4 import BeautifulSoup
from typing import List, Dict, Any
import re


class KeyboardNavChecker:
    """Checks keyboard navigation accessibility"""
    
    def __init__(self):
        pass
    
    def check_all(self, soup: BeautifulSoup, js: str = "") -> List[Dict[str, Any]]:
        """Check all keyboard navigation issues"""
        issues = []
        
        # Check interactive elements
        interactive_elements = soup.find_all(['a', 'button', 'input', 'select', 'textarea'])
        
        for element in interactive_elements:
            # Check for tabindex issues
            tabindex_issues = self._check_tabindex(element)
            issues.extend(tabindex_issues)
            
            # Check for onClick without keyboard support
            click_issues = self._check_click_handlers(element, js)
            issues.extend(click_issues)
            
            # Check for disabled state
            disabled_issues = self._check_disabled_state(element)
            issues.extend(disabled_issues)
        
        return issues
    
    def _check_tabindex(self, element) -> List[Dict[str, Any]]:
        """Check for problematic tabindex usage"""
        issues = []
        
        tabindex = element.get('tabindex')
        
        # tabindex > 0 breaks natural tab order
        if tabindex:
            try:
                tabindex_int = int(tabindex)
                if tabindex_int > 0:
                    issues.append({
                        "type": "invalid_tabindex",
                        "severity": "high",
                        "wcag_level": "A",
                        "wcag_rule": "2.1.1",
                        "element": str(element)[:200],
                        "selector": self._generate_selector(element),
                        "message": "Positive tabindex breaks natural tab order",
                        "description": "tabindex > 0 breaks the natural tab order and can confuse keyboard users.",
                        "fix_suggestion": "Remove tabindex or use tabindex='-1' if element should not be in tab order"
                    })
            except ValueError:
                pass
        
        # Check for tabindex="-1" on important links
        if tabindex == "-1" and element.name == 'a':
            href = element.get('href')
            if href and href != "#" and href != "javascript:void(0)":
                # This might be intentional, so lower severity
                issues.append({
                    "type": "removed_from_taborder",
                    "severity": "medium",
                    "wcag_level": "A",
                    "wcag_rule": "2.1.1",
                    "element": str(element)[:200],
                    "selector": self._generate_selector(element),
                    "message": "Link removed from keyboard navigation",
                    "description": "Link is removed from tab order. Ensure alternative keyboard access is provided.",
                    "fix_suggestion": "Remove tabindex='-1' or provide alternative keyboard navigation method"
                })
        
        return issues
    
    def _check_click_handlers(self, element, js: str) -> List[Dict[str, Any]]:
        """Check for onClick handlers without keyboard support"""
        issues = []
        
        # Check for onclick attribute
        has_onclick = element.get('onclick') is not None
        
        # Check for click handlers in JS
        element_id = element.get('id')
        element_class = ' '.join(element.get('class', []))
        
        has_js_click = False
        has_keyboard_support = False
        
        if js and (element_id or element_class):
            # Look for click handlers
            if element_id and f'#{element_id}' in js:
                has_js_click = True
            elif element_id and f'getElementById("{element_id}")' in js:
                has_js_click = True
            
            # Look for keyboard event handlers
            if element_id:
                keyboard_patterns = [
                    f'#{element_id}.*keydown',
                    f'#{element_id}.*keypress',
                    f'#{element_id}.*keyup',
                    f'getElementById.*{element_id}.*keydown',
                    f'getElementById.*{element_id}.*keypress'
                ]
                
                for pattern in keyboard_patterns:
                    if re.search(pattern, js, re.IGNORECASE):
                        has_keyboard_support = True
                        break
        
        if has_onclick or has_js_click:
            if not has_keyboard_support:
                # Check if element is already keyboard accessible (button, link)
                if element.name not in ['button', 'a']:
                    issues.append({
                        "type": "missing_keyboard_handler",
                        "severity": "high",
                        "wcag_level": "A",
                        "wcag_rule": "2.1.1",
                        "element": str(element)[:200],
                        "selector": self._generate_selector(element),
                        "message": "Click handler without keyboard support",
                        "description": "Elements with click handlers should also support keyboard activation (Enter/Space keys).",
                        "fix_suggestion": "Add keyboard event handlers (keydown/keypress) that respond to Enter and Space keys"
                    })
        
        return issues
    
    def _check_disabled_state(self, element) -> List[Dict[str, Any]]:
        """Check for properly announced disabled state"""
        issues = []
        
        is_disabled = (
            element.get('disabled') is not None or
            element.get('aria-disabled') == 'true'
        )
        
        # Disabled elements should have aria-disabled for screen readers
        if element.get('disabled') and not element.get('aria-disabled'):
            # This is actually OK in most cases, but aria-disabled provides better semantics
            pass  # Not a critical issue
        
        # Elements with aria-disabled should match disabled attribute
        if element.get('aria-disabled') == 'true' and element.get('disabled') is None:
            if element.name in ['input', 'button', 'select', 'textarea']:
                issues.append({
                    "type": "inconsistent_disabled_state",
                    "severity": "low",
                    "wcag_level": "A",
                    "wcag_rule": "4.1.2",
                    "element": str(element)[:200],
                    "selector": self._generate_selector(element),
                    "message": "aria-disabled without disabled attribute",
                    "description": "For form elements, use the disabled attribute along with aria-disabled for consistency.",
                    "fix_suggestion": "Add disabled attribute or remove aria-disabled if element should be interactive"
                })
        
        return issues
    
    def _generate_selector(self, element) -> str:
        """Generate CSS selector for an element"""
        try:
            if element.get('id'):
                return f"#{element.get('id')}"
            if element.get('class'):
                classes = ' '.join(element.get('class'))
                return f".{classes.split()[0]}"
            return element.name or "unknown"
        except:
            return "unknown"

