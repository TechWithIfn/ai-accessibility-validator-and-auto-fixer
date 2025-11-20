"""
Color Contrast Analyzer
Analyzes color contrast ratios for WCAG compliance
"""

from typing import Optional, Tuple
import re
import webcolors
# Note: ColorThief can be used for extracting dominant colors from images
# For now, we focus on CSS color analysis
# from colorthief import ColorThief
import io
from PIL import Image


class ContrastAnalyzer:
    """Analyzes color contrast ratios between text and background"""
    
    def __init__(self):
        pass
    
    def hex_to_rgb(self, hex_color: str) -> Tuple[int, int, int]:
        """Convert hex color to RGB tuple"""
        hex_color = hex_color.lstrip('#')
        if len(hex_color) == 3:
            hex_color = ''.join([c*2 for c in hex_color])
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    
    def rgb_to_luminance(self, r: int, g: int, b: int) -> float:
        """
        Calculate relative luminance of a color
        Formula from WCAG 2.1: https://www.w3.org/WAI/GL/wiki/Relative_luminance
        """
        def to_linear(c):
            c = c / 255.0
            if c <= 0.03928:
                return c / 12.92
            else:
                return ((c + 0.055) / 1.055) ** 2.4
        
        r_linear = to_linear(r)
        g_linear = to_linear(g)
        b_linear = to_linear(b)
        
        return 0.2126 * r_linear + 0.7152 * g_linear + 0.0722 * b_linear
    
    def calculate_contrast_ratio(self, color1: str, color2: str) -> float:
        """
        Calculate contrast ratio between two colors
        
        Args:
            color1: First color (hex, rgb, or named color)
            color2: Second color (hex, rgb, or named color)
            
        Returns:
            Contrast ratio (1.0 to 21.0)
        """
        try:
            # Convert colors to RGB
            rgb1 = self._parse_color(color1)
            rgb2 = self._parse_color(color2)
            
            if not rgb1 or not rgb2:
                return 1.0  # Default to lowest ratio if parsing fails
            
            # Calculate relative luminance
            lum1 = self.rgb_to_luminance(*rgb1)
            lum2 = self.rgb_to_luminance(*rgb2)
            
            # Ensure lighter color is in numerator
            lighter = max(lum1, lum2)
            darker = min(lum1, lum2)
            
            # Calculate contrast ratio
            ratio = (lighter + 0.05) / (darker + 0.05)
            
            return round(ratio, 2)
        except Exception:
            return 1.0
    
    def _parse_color(self, color: str) -> Optional[Tuple[int, int, int]]:
        """Parse color string to RGB tuple"""
        if not color:
            return None
        
        color = color.strip().lower()
        
        # Try named colors
        try:
            rgb = webcolors.name_to_rgb(color)
            return (rgb.red, rgb.green, rgb.blue)
        except:
            pass
        
        # Try hex color
        if color.startswith('#'):
            try:
                return self.hex_to_rgb(color)
            except:
                pass
        
        # Try rgb/rgba format
        rgb_match = re.match(r'rgba?\((\d+),\s*(\d+),\s*(\d+)', color)
        if rgb_match:
            return tuple(int(x) for x in rgb_match.groups())
        
        return None
    
    def extract_colors(
        self,
        inline_style: str,
        css: str,
        element
    ) -> Tuple[Optional[str], Optional[str]]:
        """
        Extract background and text colors from styles
        
        Args:
            inline_style: Inline style attribute
            css: CSS content
            element: BeautifulSoup element
            
        Returns:
            Tuple of (background_color, text_color)
        """
        text_color = None
        bg_color = None
        
        # Extract from inline styles
        if inline_style:
            color_match = re.search(r'color\s*:\s*([^;]+)', inline_style, re.IGNORECASE)
            if color_match:
                text_color = color_match.group(1).strip()
            
            bg_match = re.search(r'background(?:-color)?\s*:\s*([^;]+)', inline_style, re.IGNORECASE)
            if bg_match:
                bg_color = bg_match.group(1).strip()
        
        # If colors not found, try to get from CSS
        # For simplicity, default to common values
        if not text_color:
            text_color = "#000000"  # Default black text
        if not bg_color:
            bg_color = "#FFFFFF"  # Default white background
        
        return bg_color, text_color
    
    def is_large_text(self, element) -> bool:
        """
        Determine if text is considered "large text" for WCAG
        Large text is 18pt+ or 14pt+ bold
        """
        # Check font-size in style attribute
        style = element.get('style', '')
        font_size_match = re.search(r'font-size\s*:\s*(\d+(?:\.\d+)?)(px|pt|em|rem)', style, re.IGNORECASE)
        
        if font_size_match:
            size = float(font_size_match.group(1))
            unit = font_size_match.group(2).lower()
            
            # Convert to points (approximate)
            if unit == 'px':
                size_pt = size * 0.75
            elif unit == 'em' or unit == 'rem':
                size_pt = size * 12  # Assuming base 16px = 12pt
            else:
                size_pt = size
            
            # Check if bold
            is_bold = 'bold' in style.lower() or element.name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'b', 'strong']
            
            return size_pt >= 18 or (size_pt >= 14 and is_bold)
        
        # Check if it's a heading (typically large)
        if element.name in ['h1', 'h2', 'h3']:
            return True
        
        return False
    
    def suggest_accessible_color(self, current_color: str, bg_color: str, min_ratio: float = 4.5) -> str:
        """
        Suggest an accessible color that meets contrast requirements
        
        Args:
            current_color: Current text color
            bg_color: Background color
            min_ratio: Minimum contrast ratio required
            
        Returns:
            Suggested accessible color (hex)
        """
        current_rgb = self._parse_color(current_color)
        bg_rgb = self._parse_color(bg_color)
        
        if not current_rgb or not bg_rgb:
            return current_color
        
        bg_lum = self.rgb_to_luminance(*bg_rgb)
        
        # If background is light, use darker text; if dark, use lighter text
        if bg_lum > 0.5:
            # Light background - need dark text
            # Try progressively darker grays
            for gray in range(0, 100, 10):
                test_color = f"#{gray:02x}{gray:02x}{gray:02x}"
                ratio = self.calculate_contrast_ratio(test_color, bg_color)
                if ratio >= min_ratio:
                    return test_color
            return "#000000"
        else:
            # Dark background - need light text
            # Try progressively lighter grays
            for gray in range(255, 150, -10):
                test_color = f"#{gray:02x}{gray:02x}{gray:02x}"
                ratio = self.calculate_contrast_ratio(test_color, bg_color)
                if ratio >= min_ratio:
                    return test_color
            return "#FFFFFF"

