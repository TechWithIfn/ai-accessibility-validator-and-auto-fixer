"""
Auto Fixer Service
Generates automatic fixes for accessibility issues
"""

from typing import Dict, Any
from bs4 import BeautifulSoup
import re
from .ai_engine import AIEngine
from .contrast_analyzer import ContrastAnalyzer


class AutoFixer:
    """Generates automatic code fixes for accessibility issues"""
    
    def __init__(self):
        self.ai_engine = AIEngine()
        self.contrast_analyzer = ContrastAnalyzer()
    
    async def generate_fix(
        self,
        issue_type: str,
        element_selector: str,
        original_code: str,
        issue_id: str
    ) -> Dict[str, str]:
        """
        Generate automatic fix for an accessibility issue
        
        Args:
            issue_type: Type of issue (missing_alt_text, contrast_ratio, etc.)
            element_selector: CSS selector for the element
            original_code: Original HTML code
            issue_id: Unique issue ID
            
        Returns:
            Dictionary with fixed_code and explanation
        """
        try:
            # Parse HTML
            soup = BeautifulSoup(original_code, 'lxml')
            element = soup.find('img') or soup.find('a') or soup.find('button') or soup.find()
            
            if not element:
                return {
                    "fixed_code": original_code,
                    "explanation": "Could not parse element for fixing"
                }
            
            fix_methods = {
                "missing_alt_text": self._fix_missing_alt_text,
                "empty_alt_text": self._fix_empty_alt_text,
                "contrast_ratio": self._fix_contrast_ratio,
                "missing_label": self._fix_missing_label,
                "missing_aria_label": self._fix_missing_aria_label,
                "semantic_html": self._fix_semantic_html,
                "missing_lang": self._fix_missing_lang,
                "heading_hierarchy": self._fix_heading_hierarchy,
                "keyboard_navigation": self._fix_keyboard_navigation,
                "focus_indicator": self._fix_focus_indicator,
                "invalid_aria_role": self._fix_invalid_aria_role
            }
            
            fix_method = fix_methods.get(issue_type)
            
            if fix_method:
                return await fix_method(element, soup, original_code)
            else:
                return {
                    "fixed_code": original_code,
                    "explanation": f"Auto-fix not yet implemented for issue type: {issue_type}"
                }
        except Exception as e:
            return {
                "fixed_code": original_code,
                "explanation": f"Error generating fix: {str(e)}"
            }
    
    async def _fix_missing_alt_text(self, element, soup: BeautifulSoup, original: str) -> Dict[str, str]:
        """Fix missing alt text"""
        if element.name == 'img':
            # Generate alt text using AI
            img_src = element.get('src', '')
            context = element.find_previous(['h1', 'h2', 'h3', 'p'])
            context_text = context.get_text(strip=True) if context else None
            
            # Try to generate descriptive alt text
            alt_text = await self.ai_engine.generate_alt_text(img_src, context_text)
            
            element['alt'] = alt_text
            
            return {
                "fixed_code": str(element),
                "explanation": f"Added alt attribute with generated description: '{alt_text}'. This provides text alternatives for screen reader users."
            }
        
        return {"fixed_code": original, "explanation": "Element is not an image"}
    
    async def _fix_empty_alt_text(self, element, soup: BeautifulSoup, original: str) -> Dict[str, str]:
        """Fix empty alt text"""
        if element.name == 'img':
            img_src = element.get('src', '')
            context = element.find_previous(['h1', 'h2', 'h3', 'p'])
            context_text = context.get_text(strip=True) if context else None
            
            # Check if image is decorative
            if element.get('role') == 'presentation' or element.get('aria-hidden') == 'true':
                return {
                    "fixed_code": original,
                    "explanation": "Image is already marked as decorative, empty alt is appropriate."
                }
            
            # Generate descriptive alt text
            alt_text = await self.ai_engine.generate_alt_text(img_src, context_text)
            element['alt'] = alt_text
            
            return {
                "fixed_code": str(element),
                "explanation": f"Added descriptive alt text: '{alt_text}'. If the image is decorative, consider adding role='presentation' instead."
            }
        
        return {"fixed_code": original, "explanation": "Element is not an image"}
    
    async def _fix_contrast_ratio(self, element, soup: BeautifulSoup, original: str) -> Dict[str, str]:
        """Fix color contrast issues"""
        # Extract colors from style or CSS
        style = element.get('style', '')
        
        # Try to find colors
        color_match = re.search(r'color\s*:\s*([^;]+)', style, re.IGNORECASE)
        bg_match = re.search(r'background(?:-color)?\s*:\s*([^;]+)', style, re.IGNORECASE)
        
        if color_match and bg_match:
            text_color = color_match.group(1).strip()
            bg_color = bg_match.group(1).strip()
            
            # Get suggested color
            suggestion = await self.ai_engine.suggest_contrast_fix(text_color, bg_color)
            suggested_color = suggestion["suggested_color"]
            
            # Update style
            new_style = re.sub(
                r'color\s*:\s*[^;]+',
                f'color: {suggested_color}',
                style,
                flags=re.IGNORECASE
            )
            
            element['style'] = new_style
            
            return {
                "fixed_code": str(element),
                "explanation": f"Updated text color to {suggested_color} to meet WCAG contrast requirements. {suggestion['explanation']}"
            }
        else:
            # Add style attribute with better contrast
            element['style'] = (style + "; " if style else "") + "color: #000000; background-color: #FFFFFF;"
            
            return {
                "fixed_code": str(element),
                "explanation": "Added high-contrast colors (black text on white background) to meet WCAG standards. Adjust colors as needed for your design."
            }
    
    async def _fix_missing_label(self, element, soup: BeautifulSoup, original: str) -> Dict[str, str]:
        """Fix missing form label"""
        if element.name not in ['input', 'select', 'textarea']:
            return {"fixed_code": original, "explanation": "Element is not a form input"}
        
        input_id = element.get('id')
        input_name = element.get('name', 'input')
        input_type = element.get('type', 'text')
        
        # Generate ID if missing
        if not input_id:
            input_id = f"input-{input_name}-{hash(input_name) % 10000}"
            element['id'] = input_id
        
        # Create label element
        label_text = input_name.replace('_', ' ').replace('-', ' ').title()
        
        label_html = f'<label for="{input_id}">{label_text}</label>'
        
        # Wrap input with label
        fixed_html = f"{label_html}\n{element}"
        
        return {
            "fixed_code": fixed_html,
            "explanation": f"Added <label> element associated with the input using the 'for' attribute. The label text '{label_text}' helps screen reader users understand the input purpose."
        }
    
    async def _fix_missing_aria_label(self, element, soup: BeautifulSoup, original: str) -> Dict[str, str]:
        """Fix missing ARIA label"""
        # Determine element type
        element_type = element.name or "element"
        if element.get('role'):
            element_type = element.get('role')
        
        # Get context
        text_content = element.get_text(strip=True)
        context = text_content or element.get('title') or element.get('aria-label')
        
        # Generate ARIA label
        aria_label = await self.ai_engine.generate_aria_label(
            str(element),
            element_type,
            context
        )
        
        element['aria-label'] = aria_label
        
        return {
            "fixed_code": str(element),
            "explanation": f"Added aria-label='{aria_label}' to provide an accessible name for screen reader users."
        }
    
    async def _fix_semantic_html(self, element, soup: BeautifulSoup, original: str) -> Dict[str, str]:
        """Fix semantic HTML issues"""
        current_tag = element.name
        
        # Get suggestion
        suggestion = await self.ai_engine.suggest_html_semantic_fix(str(element), current_tag)
        
        if suggestion["suggested_tag"] != current_tag:
            # Change tag name
            element.name = suggestion["suggested_tag"]
            
            # Remove role if it matches the new tag
            if element.get('role') == suggestion["suggested_tag"]:
                del element['role']
            
            return {
                "fixed_code": str(element),
                "explanation": f"Changed <{current_tag}> to <{suggestion['suggested_tag']}>. {suggestion['explanation']}"
            }
        
        return {
            "fixed_code": original,
            "explanation": suggestion["explanation"]
        }
    
    async def _fix_missing_lang(self, element, soup: BeautifulSoup, original: str) -> Dict[str, str]:
        """Fix missing lang attribute"""
        html_tag = soup.find('html')
        if html_tag:
            html_tag['lang'] = 'en'
            return {
                "fixed_code": str(html_tag),
                "explanation": "Added lang='en' attribute to <html> element. Update the language code if the page is in a different language. This helps screen readers pronounce content correctly."
            }
        
        return {
            "fixed_code": original,
            "explanation": "Could not find <html> tag to add lang attribute"
        }
    
    async def _fix_heading_hierarchy(self, element, soup: BeautifulSoup, original: str) -> Dict[str, str]:
        """Fix heading hierarchy issues"""
        if element.name and element.name.startswith('h'):
            current_level = int(element.name[1])
            
            # Find previous heading
            prev_heading = element.find_previous(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
            
            if prev_heading:
                prev_level = int(prev_heading.name[1])
                if current_level > prev_level + 1:
                    # Fix to proper level
                    suggested_level = prev_level + 1
                    element.name = f"h{suggested_level}"
                    
                    return {
                        "fixed_code": str(element),
                        "explanation": f"Changed heading from h{current_level} to h{suggested_level} to maintain proper hierarchy. Headings should not skip levels."
                    }
        
        return {
            "fixed_code": original,
            "explanation": "Could not determine heading hierarchy issue"
        }
    
    async def _fix_keyboard_navigation(self, element, soup: BeautifulSoup, original: str) -> Dict[str, str]:
        """Fix keyboard navigation issues"""
        # Remove problematic tabindex
        if element.get('tabindex'):
            tabindex = element.get('tabindex')
            if tabindex != "-1":
                del element['tabindex']
                return {
                    "fixed_code": str(element),
                    "explanation": "Removed tabindex attribute to restore natural tab order. Keyboard users can now navigate in the expected order."
                }
            elif tabindex == "-1" and element.name == 'a':
                del element['tabindex']
                return {
                    "fixed_code": str(element),
                    "explanation": "Removed tabindex='-1' to restore keyboard navigation. Links should be keyboard accessible unless they are decorative."
                }
        
        # Add keyboard event handler suggestions (code-level fix)
        if element.get('onclick'):
            return {
                "fixed_code": original,
                "explanation": "Element has onclick handler. Add keyboard event handlers (keydown/keypress) that respond to Enter and Space keys. Consider using <button> instead of div/span with onclick."
            }
        
        return {
            "fixed_code": original,
            "explanation": "No keyboard navigation fix needed or fix requires JavaScript code changes"
        }
    
    async def _fix_focus_indicator(self, element, soup: BeautifulSoup, original: str) -> Dict[str, str]:
        """Fix missing focus indicators"""
        # This typically requires CSS changes, but we can add inline style as a quick fix
        style = element.get('style', '')
        
        # Check if focus style exists
        if ':focus' not in style and 'outline' not in style:
            # Add focus style
            focus_style = "outline: 2px solid #005fcc; outline-offset: 2px;"
            
            return {
                "fixed_code": original,
                "explanation": f"Focus indicators should be added via CSS. Add this style to your CSS: `{element.name}:focus {{ {focus_style} }}`. This makes keyboard navigation visible to users."
            }
        
        return {
            "fixed_code": original,
            "explanation": "Focus indicator fix requires CSS changes. Add :focus styles to all interactive elements."
        }
    
    async def _fix_invalid_aria_role(self, element, soup: BeautifulSoup, original: str) -> Dict[str, str]:
        """Fix invalid ARIA role"""
        invalid_role = element.get('role')
        
        if invalid_role:
            # Remove invalid role
            del element['role']
            
            return {
                "fixed_code": str(element),
                "explanation": f"Removed invalid ARIA role '{invalid_role}'. Use valid ARIA roles from the ARIA specification, or use semantic HTML elements instead."
            }
        
        return {
            "fixed_code": original,
            "explanation": "No invalid ARIA role found"
        }

