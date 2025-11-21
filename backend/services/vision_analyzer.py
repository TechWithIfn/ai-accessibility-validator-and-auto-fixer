"""
Computer Vision Module
Analyzes screenshots for visual accessibility issues (contrast, focus indicators, layout)
"""

import cv2
import numpy as np
from PIL import Image
import base64
from io import BytesIO
from typing import List, Dict, Any, Optional, Tuple
from colorthief import ColorThief
import webcolors


class VisionAnalyzer:
    """Computer vision analysis for accessibility issues"""
    
    def __init__(self):
        self.contrast_threshold_aa = 4.5  # WCAG AA
        self.contrast_threshold_aaa = 7.0  # WCAG AAA
    
    def analyze_screenshot(
        self,
        screenshot_b64: str,
        html: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Analyze screenshot for visual accessibility issues
        
        Args:
            screenshot_b64: Base64 encoded screenshot
            html: Optional HTML content for context
            metadata: Optional metadata about page elements
            
        Returns:
            List of visual accessibility issues
        """
        issues = []
        
        try:
            # Decode screenshot
            image_bytes = base64.b64decode(screenshot_b64)
            image = Image.open(BytesIO(image_bytes))
            img_array = np.array(image)
            
            # Convert to OpenCV format
            if len(img_array.shape) == 3:
                cv_image = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
            else:
                cv_image = img_array
            
            # Run all visual checks
            contrast_issues = self._check_text_contrast(cv_image, html, metadata)
            focus_issues = self._check_focus_indicators(cv_image, metadata)
            layout_issues = self._check_layout_issues(cv_image, metadata)
            overlap_issues = self._check_text_overlap(cv_image)
            
            issues.extend(contrast_issues)
            issues.extend(focus_issues)
            issues.extend(layout_issues)
            issues.extend(overlap_issues)
        
        except Exception as e:
            issues.append({
                'type': 'vision_analysis_error',
                'severity': 'medium',
                'message': f'Error analyzing screenshot: {str(e)}',
                'wcag_level': 'AA',
                'wcag_rule': '1.4.3'
            })
        
        return issues
    
    def _check_text_contrast(
        self,
        image: np.ndarray,
        html: Optional[str],
        metadata: Optional[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Check text contrast ratios in screenshot"""
        issues = []
        
        # This is a simplified version
        # In production, you'd use OCR to detect text and calculate contrast
        # or integrate with browser DevTools to get actual rendered text
        
        # For now, we'll detect text regions using edge detection
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Use edge detection to find text-like regions
        edges = cv2.Canny(gray, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Analyze contrast in text regions
        for i, contour in enumerate(contours[:20]):  # Limit to first 20 for performance
            x, y, w, h = cv2.boundingRect(contour)
            
            if w < 10 or h < 10 or w > image.shape[1] * 0.8:  # Filter small/large regions
                continue
            
            # Extract region
            region = image[y:y+h, x:x+w]
            
            if region.size == 0:
                continue
            
            # Calculate average colors
            mean_color = np.mean(region, axis=(0, 1))
            
            # Simplified contrast check (would need actual text/background colors)
            # In production, use OCR + color extraction
            
            # This is a placeholder - actual implementation would:
            # 1. Use OCR (Tesseract) to detect text regions
            # 2. Extract foreground and background colors
            # 3. Calculate contrast ratio using WCAG formula
            # 4. Compare against thresholds
        
        return issues
    
    def _check_focus_indicators(
        self,
        image: np.ndarray,
        metadata: Optional[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Check for visible focus indicators"""
        issues = []
        
        if not metadata or 'form_elements' not in metadata:
            return issues
        
        # Check if focusable elements have visible focus styles
        # This is simplified - in production, would:
        # 1. Simulate focus on each element
        # 2. Take screenshot with element focused
        # 3. Detect outline/border changes
        
        focusable_count = len(metadata.get('form_elements', []))
        
        if focusable_count > 0:
            # Placeholder check - actual implementation would detect focus rings
            issues.append({
                'type': 'missing_focus_indicator',
                'severity': 'high',
                'message': 'Some focusable elements may lack visible focus indicators',
                'wcag_level': 'AA',
                'wcag_rule': '2.4.7',
                'description': 'Keyboard focus should be visible with a clear indicator',
                'recommendation': 'Add CSS focus-visible styles with high contrast outline'
            })
        
        return issues
    
    def _check_layout_issues(
        self,
        image: np.ndarray,
        metadata: Optional[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Check for layout issues (misalignment, spacing)"""
        issues = []
        
        # Detect horizontal and vertical alignment issues
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Use Hough line detection to find alignment
        edges = cv2.Canny(gray, 50, 150)
        lines = cv2.HoughLinesP(edges, 1, np.pi/180, 100, minLineLength=50, maxLineGap=10)
        
        if lines is not None and len(lines) > 0:
            # Check for misalignment
            horizontal_lines = [l for l in lines if abs(l[0][3] - l[0][1]) < 5]
            vertical_lines = [l for l in lines if abs(l[0][2] - l[0][0]) < 5]
            
            if len(horizontal_lines) > 0:
                # Check alignment consistency
                y_coords = [l[0][1] for l in horizontal_lines]
                if len(set(y_coords)) > len(y_coords) * 0.5:  # Many different y-coordinates
                    issues.append({
                        'type': 'layout_misalignment',
                        'severity': 'low',
                        'message': 'Potential layout misalignment detected',
                        'wcag_level': 'AA',
                        'wcag_rule': '1.3.2',
                        'description': 'Elements should be consistently aligned for better readability'
                    })
        
        return issues
    
    def _check_text_overlap(self, image: np.ndarray) -> List[Dict[str, Any]]:
        """Check for overlapping text elements"""
        issues = []
        
        # Simplified overlap detection
        # In production, would use OCR to detect text regions and check for overlaps
        
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Use text detection (would need OCR in production)
        # For now, detect high-density text regions
        
        # This is a placeholder - actual implementation would:
        # 1. Use OCR (Tesseract/EasyOCR) to detect text bounding boxes
        # 2. Check for overlapping bounding boxes
        # 3. Detect text that's too close together
        
        return issues
    
    def calculate_contrast_ratio(
        self,
        color1: Tuple[int, int, int],
        color2: Tuple[int, int, int]
    ) -> float:
        """
        Calculate WCAG contrast ratio between two colors
        
        Args:
            color1: RGB tuple of first color
            color2: RGB tuple of second color
            
        Returns:
            Contrast ratio (1.0 to 21.0)
        """
        def get_luminance(color):
            """Calculate relative luminance"""
            r, g, b = color
            r = r / 255.0
            g = g / 255.0
            b = b / 255.0
            
            # Apply gamma correction
            r = r / 12.92 if r <= 0.03928 else ((r + 0.055) / 1.055) ** 2.4
            g = g / 12.92 if g <= 0.03928 else ((g + 0.055) / 1.055) ** 2.4
            b = b / 12.92 if b <= 0.03928 else ((b + 0.055) / 1.055) ** 2.4
            
            return 0.2126 * r + 0.7152 * g + 0.0722 * b
        
        lum1 = get_luminance(color1)
        lum2 = get_luminance(color2)
        
        lighter = max(lum1, lum2)
        darker = min(lum1, lum2)
        
        return (lighter + 0.05) / (darker + 0.05)
    
    def extract_colors_from_image(self, image_b64: str, count: int = 5) -> List[Tuple[int, int, int]]:
        """Extract dominant colors from image"""
        try:
            image_bytes = base64.b64decode(image_b64)
            color_thief = ColorThief(BytesIO(image_bytes))
            palette = color_thief.get_palette(color_count=count, quality=1)
            return palette
        except:
            return []

