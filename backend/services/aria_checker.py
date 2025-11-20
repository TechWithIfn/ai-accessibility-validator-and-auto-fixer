"""
ARIA Attribute Checker
Validates ARIA attribute usage for accessibility
"""

from bs4 import BeautifulSoup
from typing import List, Dict, Any, Optional


class ARIAChecker:
    """Checks ARIA attribute usage and validity"""
    
    def __init__(self):
        # Valid ARIA roles
        self.valid_roles = {
            'button', 'checkbox', 'dialog', 'gridcell', 'link', 'listbox',
            'option', 'progressbar', 'radio', 'slider', 'spinbutton',
            'switch', 'tab', 'tabpanel', 'textbox', 'tooltip', 'treeitem',
            'alert', 'alertdialog', 'article', 'banner', 'cell', 'columnheader',
            'complementary', 'contentinfo', 'definition', 'directory', 'document',
            'feed', 'figure', 'form', 'group', 'heading', 'img', 'list', 'listitem',
            'log', 'main', 'marquee', 'math', 'menu', 'menubar', 'menuitem',
            'menuitemcheckbox', 'menuitemradio', 'navigation', 'none', 'note',
            'presentation', 'progressbar', 'radio', 'radiogroup', 'region',
            'row', 'rowgroup', 'rowheader', 'scrollbar', 'search', 'searchbox',
            'separator', 'status', 'switch', 'tab', 'table', 'tablist', 'tabpanel',
            'term', 'textbox', 'timer', 'toolbar', 'tooltip', 'tree', 'treegrid',
            'treeitem'
        }
    
    def check_all(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Run all ARIA checks"""
        issues = []
        
        # Check all elements with ARIA attributes
        # Find all elements and filter those with ARIA attributes
        all_elements = soup.find_all()
        elements_with_aria = []
        for element in all_elements:
            if element.attrs:
                # Check if element has any ARIA attributes or role
                has_aria = any(
                    key.startswith('aria-') or key == 'role' 
                    for key in element.attrs.keys()
                )
                if has_aria:
                    elements_with_aria.append(element)
        
        for element in elements_with_aria:
            # Check role validity
            role_issues = self._check_role(element)
            issues.extend(role_issues)
            
            # Check aria-label/aria-labelledby
            label_issues = self._check_labels(element)
            issues.extend(label_issues)
            
            # Check aria-required
            required_issues = self._check_required(element)
            issues.extend(required_issues)
            
            # Check aria-hidden misuse
            hidden_issues = self._check_hidden(element)
            issues.extend(hidden_issues)
        
        return issues
    
    def _check_role(self, element) -> List[Dict[str, Any]]:
        """Check if role attribute is valid"""
        issues = []
        role = element.get('role')
        
        if role and role not in self.valid_roles:
            issues.append({
                "type": "invalid_aria_role",
                "severity": "high",
                "wcag_level": "A",
                "wcag_rule": "4.1.2",
                "element": str(element)[:200],
                "selector": self._generate_selector(element),
                "message": f"Invalid ARIA role: {role}",
                "description": f"The role '{role}' is not a valid ARIA role. This can confuse screen readers.",
                "fix_suggestion": f"Use a valid ARIA role from the ARIA specification or remove the role attribute if not needed."
            })
        
        # Check for redundant role (e.g., role="button" on <button>)
        if role:
            semantic_role = self._get_semantic_role(element)
            if semantic_role and role == semantic_role:
                issues.append({
                    "type": "redundant_aria_role",
                    "severity": "low",
                    "wcag_level": "A",
                    "wcag_rule": "4.1.2",
                    "element": str(element)[:200],
                    "selector": self._generate_selector(element),
                    "message": f"Redundant ARIA role: {role}",
                    "description": f"The role '{role}' is redundant because the element already has that semantic meaning.",
                    "fix_suggestion": "Remove the redundant role attribute"
                })
        
        return issues
    
    def _check_labels(self, element) -> List[Dict[str, Any]]:
        """Check aria-label and aria-labelledby usage"""
        issues = []
        
        # Elements that need accessible names
        elements_needing_name = ['button', 'link', 'input', 'select', 'textarea']
        
        role = element.get('role')
        element_name = element.name
        
        if (element_name in elements_needing_name or
            role in ['button', 'link', 'textbox', 'checkbox', 'radio', 'switch']):
            
            has_label = (
                element.get('aria-label') or
                element.get('aria-labelledby') or
                (element_name == 'input' and element.get('placeholder'))
            )
            
            # For buttons, check text content
            if element_name == 'button' or role == 'button':
                if element.get_text(strip=True):
                    has_label = True
            
            # For inputs, check for <label>
            if element_name == 'input':
                input_id = element.get('id')
                if input_id:
                    # Check if label exists (would be caught by form label checker)
                    pass
            
            if not has_label:
                issues.append({
                    "type": "missing_aria_label",
                    "severity": "high",
                    "wcag_level": "A",
                    "wcag_rule": "4.1.2",
                    "element": str(element)[:200],
                    "selector": self._generate_selector(element),
                    "message": "Element missing accessible name",
                    "description": "Interactive elements must have an accessible name for screen reader users.",
                    "fix_suggestion": "Add aria-label or aria-labelledby attribute, or ensure element has visible text/label"
                })
        
        return issues
    
    def _check_required(self, element) -> List[Dict[str, Any]]:
        """Check aria-required usage"""
        issues = []
        
        aria_required = element.get('aria-required')
        
        # aria-required should only be on form elements
        if aria_required and element.name not in ['input', 'select', 'textarea']:
            role = element.get('role')
            if role not in ['textbox', 'checkbox', 'radio', 'combobox', 'listbox']:
                issues.append({
                    "type": "misused_aria_required",
                    "severity": "medium",
                    "wcag_level": "A",
                    "wcag_rule": "4.1.2",
                    "element": str(element)[:200],
                    "selector": self._generate_selector(element),
                    "message": "aria-required used on non-form element",
                    "description": "aria-required should only be used on form input elements.",
                    "fix_suggestion": "Remove aria-required or use required attribute on form element"
                })
        
        return issues
    
    def _check_hidden(self, element) -> List[Dict[str, Any]]:
        """Check for aria-hidden misuse"""
        issues = []
        
        aria_hidden = element.get('aria-hidden')
        
        # aria-hidden="true" on focusable elements is problematic
        if aria_hidden == 'true':
            is_focusable = (
                element.name in ['a', 'button', 'input', 'select', 'textarea'] or
                element.get('tabindex') and element.get('tabindex') != '-1' or
                element.get('role') in ['button', 'link', 'textbox']
            )
            
            if is_focusable:
                issues.append({
                    "type": "aria_hidden_focusable",
                    "severity": "high",
                    "wcag_level": "A",
                    "wcag_rule": "4.1.2",
                    "element": str(element)[:200],
                    "selector": self._generate_selector(element),
                    "message": "Focusable element hidden from screen readers",
                    "description": "Using aria-hidden='true' on focusable elements hides them from screen readers but keyboard users can still reach them, creating confusion.",
                    "fix_suggestion": "Remove aria-hidden or make element non-focusable"
                })
        
        return issues
    
    def _get_semantic_role(self, element) -> Optional[str]:
        """Get the semantic role of an HTML element"""
        semantic_roles = {
            'button': 'button',
            'a': 'link',
            'input': 'textbox' if element.get('type') == 'text' else None,
            'img': 'img',
            'nav': 'navigation',
            'main': 'main',
            'article': 'article',
            'aside': 'complementary',
            'header': 'banner',
            'footer': 'contentinfo'
        }
        
        return semantic_roles.get(element.name)
    
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

