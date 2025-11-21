"""
Patch Generator Service
Generates code patches with confidence scores and before/after comparisons
"""

from typing import Dict, Any, List, Optional, Tuple
from bs4 import BeautifulSoup
import difflib
import json
from .context_fusion import ContextFusion


class PatchGenerator:
    """Generates HTML/CSS/JS/ARIA patches with confidence scores"""
    
    def __init__(self):
        self.context_fusion = ContextFusion()
    
    async def generate_patch(
        self,
        issue: Dict[str, Any],
        original_html: str,
        original_css: Optional[str] = None,
        original_js: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate a code patch for an issue
        
        Args:
            issue: Issue dictionary with type, selector, etc.
            original_html: Original HTML content
            original_css: Original CSS content (optional)
            original_js: Original JS content (optional)
            context: Optional context from context fusion
            
        Returns:
            Dictionary with patch, confidence score, and before/after code
        """
        issue_type = issue.get('type', '')
        selector = issue.get('selector', '')
        confidence = issue.get('confidence', 0.5)
        fix_confidence = issue.get('fix_confidence', 0.7)
        
        # Generate fix based on issue type
        patch = {
            'issue_id': issue.get('id', ''),
            'issue_type': issue_type,
            'selector': selector,
            'wcag_level': issue.get('wcag_level', 'A'),
            'wcag_rule': issue.get('wcag_rule', ''),
            'severity': issue.get('severity', 'medium'),
            'confidence': confidence,
            'fix_confidence': fix_confidence,
            'before': {},
            'after': {},
            'diff': {},
            'patch_type': 'html',  # html, css, js, or aria
            'explanation': issue.get('description', ''),
            'recommendation': issue.get('recommended_fix', {}),
            'requires_approval': fix_confidence < 0.8
        }
        
        # Generate HTML patch
        if issue_type in ['missing_alt_text', 'empty_alt_text', 'missing_label', 
                          'improper_semantics', 'missing_aria_label']:
            html_patch = await self._generate_html_patch(issue, original_html)
            patch['before']['html'] = html_patch.get('before', '')
            patch['after']['html'] = html_patch.get('after', '')
            patch['diff']['html'] = self._generate_unified_diff(
                html_patch.get('before', ''),
                html_patch.get('after', '')
            )
            patch['patch_type'] = 'html'
        
        # Generate CSS patch
        elif issue_type in ['low_contrast', 'missing_focus_indicator', 'layout_issue']:
            css_patch = await self._generate_css_patch(issue, original_css or '', selector)
            patch['before']['css'] = css_patch.get('before', '')
            patch['after']['css'] = css_patch.get('after', '')
            patch['diff']['css'] = self._generate_unified_diff(
                css_patch.get('before', ''),
                css_patch.get('after', '')
            )
            patch['patch_type'] = 'css'
        
        # Generate ARIA patch
        elif issue_type in ['missing_aria', 'invalid_aria', 'missing_aria_label']:
            aria_patch = await self._generate_aria_patch(issue, original_html)
            patch['before']['html'] = aria_patch.get('before', '')
            patch['after']['html'] = aria_patch.get('after', '')
            patch['diff']['html'] = self._generate_unified_diff(
                aria_patch.get('before', ''),
                aria_patch.get('after', '')
            )
            patch['patch_type'] = 'aria'
        
        # Generate JS injection script for preview
        patch['js_injection'] = self._generate_js_injection(issue, patch)
        
        # Generate GitHub-compatible patch format
        patch['github_patch'] = self._generate_github_patch(patch)
        
        return patch
    
    async def _generate_html_patch(
        self,
        issue: Dict[str, Any],
        original_html: str
    ) -> Dict[str, str]:
        """Generate HTML patch"""
        soup = BeautifulSoup(original_html, 'lxml')
        selector = issue.get('selector', '')
        issue_type = issue.get('type', '')
        
        # Find element
        element = None
        if selector:
            try:
                element = soup.select_one(selector)
            except:
                pass
        
        if not element:
            return {'before': original_html, 'after': original_html}
        
        before_code = str(element)
        
        # Apply fix based on issue type
        if issue_type == 'missing_alt_text':
            if element.name == 'img':
                alt_text = issue.get('ai_suggestion') or 'Descriptive image text'
                element['alt'] = alt_text
        
        elif issue_type == 'missing_label':
            # Add label for form element
            if element.name in ['input', 'textarea', 'select']:
                elem_id = element.get('id') or f"input-{hash(selector)}"
                if not element.get('id'):
                    element['id'] = elem_id
                
                label_text = issue.get('ai_suggestion') or 'Field label'
                label = soup.new_tag('label', attrs={'for': elem_id})
                label.string = label_text
                element.insert_before(label)
        
        elif issue_type == 'improper_semantics':
            # Convert div to semantic element
            if element.name == 'div' and element.get('onclick'):
                button = soup.new_tag('button', attrs={'type': 'button'})
                button.string = element.get_text()
                for attr, value in element.attrs.items():
                    if attr != 'onclick':
                        button[attr] = value
                element.replace_with(button)
        
        elif issue_type == 'missing_aria_label':
            aria_label = issue.get('ai_suggestion') or 'Interactive element'
            element['aria-label'] = aria_label
        
        after_code = str(element)
        return {'before': before_code, 'after': after_code}
    
    async def _generate_css_patch(
        self,
        issue: Dict[str, Any],
        original_css: str,
        selector: str
    ) -> Dict[str, str]:
        """Generate CSS patch"""
        issue_type = issue.get('type', '')
        
        before_css = original_css
        
        # Add CSS fix
        if issue_type == 'missing_focus_indicator':
            focus_style = f"""
/* Accessibility fix: Add visible focus indicator */
{selector}:focus-visible {{
    outline: 2px solid #0066cc;
    outline-offset: 2px;
}}
"""
            after_css = original_css + focus_style
        
        elif issue_type == 'low_contrast':
            contrast_fix = issue.get('recommended_fix', {})
            color = contrast_fix.get('color', '#000000')
            background = contrast_fix.get('background', '#ffffff')
            
            contrast_style = f"""
/* Accessibility fix: Increase contrast ratio */
{selector} {{
    color: {color};
    background-color: {background};
}}
"""
            after_css = original_css + contrast_style
        
        else:
            after_css = original_css
        
        return {'before': before_css, 'after': after_css}
    
    async def _generate_aria_patch(
        self,
        issue: Dict[str, Any],
        original_html: str
    ) -> Dict[str, str]:
        """Generate ARIA patch"""
        soup = BeautifulSoup(original_html, 'lxml')
        selector = issue.get('selector', '')
        
        element = None
        if selector:
            try:
                element = soup.select_one(selector)
            except:
                pass
        
        if not element:
            return {'before': original_html, 'after': original_html}
        
        before_code = str(element)
        
        # Add ARIA attributes
        issue_type = issue.get('type', '')
        if issue_type == 'missing_aria_label':
            aria_label = issue.get('ai_suggestion') or 'Interactive element'
            element['aria-label'] = aria_label
        elif issue_type == 'missing_aria_labelledby':
            # Find associated label
            elem_id = element.get('id')
            if elem_id:
                label = soup.find('label', attrs={'for': elem_id})
                if label:
                    element['aria-labelledby'] = elem_id + '-label'
                    if not label.get('id'):
                        label['id'] = elem_id + '-label'
        
        after_code = str(element)
        return {'before': before_code, 'after': after_code}
    
    def _generate_js_injection(
        self,
        issue: Dict[str, Any],
        patch: Dict[str, Any]
    ) -> str:
        """Generate JavaScript injection script for browser preview"""
        selector = issue.get('selector', '')
        patch_type = patch.get('patch_type', 'html')
        
        js_code = f"""
// Accessibility fix injection for: {issue.get('type', '')}
(function() {{
    const element = document.querySelector('{selector}');
    if (!element) return;
    
    try {{
"""
        
        issue_type = issue.get('type', '')
        
        if issue_type == 'missing_alt_text' and patch_type == 'html':
            alt_text = issue.get('ai_suggestion') or 'Descriptive image text'
            js_code += f"        element.setAttribute('alt', '{alt_text}');\n"
        
        elif issue_type == 'missing_focus_indicator' and patch_type == 'css':
            js_code += f"""
        // Add focus indicator styles
        const style = document.createElement('style');
        style.textContent = `{selector}:focus-visible {{ outline: 2px solid #0066cc; outline-offset: 2px; }}`;
        document.head.appendChild(style);
"""
        
        elif issue_type == 'missing_aria_label':
            aria_label = issue.get('ai_suggestion') or 'Interactive element'
            js_code += f"        element.setAttribute('aria-label', '{aria_label}');\n"
        
        js_code += """
    } catch (e) {
        console.error('Error applying accessibility fix:', e);
    }
})();
"""
        return js_code
    
    def _generate_github_patch(self, patch: Dict[str, Any]) -> str:
        """Generate GitHub-compatible unified diff format"""
        patch_type = patch.get('patch_type', 'html')
        diff_content = patch.get('diff', {}).get(patch_type, '')
        
        if not diff_content:
            return ''
        
        # Format as GitHub unified diff
        file_path = f"fix-{patch.get('issue_id', 'unknown')}.{patch_type}"
        
        github_patch = f"""diff --git a/{file_path} b/{file_path}
index 0000000..1111111 100644
--- a/{file_path}
+++ b/{file_path}
{diff_content}
"""
        return github_patch
    
    def _generate_unified_diff(
        self,
        before: str,
        after: str
    ) -> str:
        """Generate unified diff between before and after code"""
        before_lines = before.splitlines(keepends=True)
        after_lines = after.splitlines(keepends=True)
        
        diff = difflib.unified_diff(
            before_lines,
            after_lines,
            lineterm='',
            n=3
        )
        
        return ''.join(diff)
    
    async def generate_batch_patches(
        self,
        issues: List[Dict[str, Any]],
        original_html: str,
        original_css: Optional[str] = None,
        original_js: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Generate patches for multiple issues"""
        patches = []
        
        for issue in issues:
            patch = await self.generate_patch(
                issue,
                original_html,
                original_css,
                original_js
            )
            patches.append(patch)
        
        return patches
    
    def calculate_overall_confidence(self, patches: List[Dict[str, Any]]) -> float:
        """Calculate overall confidence for a batch of patches"""
        if not patches:
            return 0.0
        
        confidences = [p.get('fix_confidence', 0.5) for p in patches]
        return sum(confidences) / len(confidences)

