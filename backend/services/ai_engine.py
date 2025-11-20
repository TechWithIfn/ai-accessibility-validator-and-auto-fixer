"""
AI Engine Service
Handles AI-powered accessibility features:
- Image captioning for alt text generation
- Text readability analysis
- Smart fix suggestions
"""

from typing import Optional, Dict, Any
import re
from PIL import Image
import requests
from io import BytesIO


class AIEngine:
    """AI-powered accessibility analysis and generation"""
    
    def __init__(self):
        # In production, initialize actual ML models here
        # For now, use rule-based approaches that can be enhanced with real models
        pass
    
    async def generate_alt_text(self, image_url: str, context: Optional[str] = None) -> str:
        """
        Generate alt text for an image using AI captioning
        
        Args:
            image_url: URL of the image
            context: Optional context about the image
            
        Returns:
            Generated alt text description
        """
        try:
            # In production: Use actual image captioning model (e.g., BLIP, CLIP, GPT-4 Vision)
            # For demo: Use rule-based approach
            
            # Download image
            try:
                response = requests.get(image_url, timeout=10)
                image = Image.open(BytesIO(response.content))
                
                # Analyze image characteristics
                width, height = image.size
                format_type = image.format
                
                # Basic heuristic-based description
                description = f"Image ({width}x{height} pixels, {format_type} format)"
                
                # Add context if available
                if context:
                    description = f"{context} - {description}"
                
                # In production, use actual ML model:
                # from transformers import pipeline
                # captioner = pipeline("image-to-text", model="Salesforce/blip-image-captioning-base")
                # description = captioner(image_url)[0]['generated_text']
                
                return description
            except:
                # Fallback if image can't be loaded
                return context or "Image"
        except Exception as e:
            return context or "Image description"
    
    async def enhance_alt_text(self, current_alt: str, image_context: Optional[str] = None) -> str:
        """
        Enhance existing alt text with more descriptive content
        
        Args:
            current_alt: Current alt text
            image_context: Context about the image
            
        Returns:
            Enhanced alt text
        """
        # In production: Use GPT or similar to enhance text
        # For demo: Simple enhancement
        
        if not current_alt or current_alt.strip() == "":
            return image_context or "Decorative image" if not image_context else "Image"
        
        # Check if alt text is too generic
        generic_terms = ["image", "photo", "picture", "img", "graphic"]
        if current_alt.lower() in generic_terms:
            if image_context:
                return f"{image_context} - {current_alt}"
            return f"Descriptive {current_alt}"
        
        return current_alt
    
    async def suggest_contrast_fix(self, current_color: str, bg_color: str, element_type: str = "text") -> Dict[str, str]:
        """
        Suggest color fix for contrast issues using AI
        
        Args:
            current_color: Current text/foreground color
            bg_color: Background color
            element_type: Type of element (text, link, button, etc.)
            
        Returns:
            Dictionary with suggested color and explanation
        """
        # Use contrast analyzer logic
        from .contrast_analyzer import ContrastAnalyzer
        
        analyzer = ContrastAnalyzer()
        
        # Determine required ratio based on element type
        if element_type == "text":
            min_ratio = 4.5  # WCAG AA standard text
        elif element_type == "large_text":
            min_ratio = 3.0  # WCAG AA large text
        else:
            min_ratio = 4.5
        
        suggested_color = analyzer.suggest_accessible_color(current_color, bg_color, min_ratio)
        contrast_ratio = analyzer.calculate_contrast_ratio(suggested_color, bg_color)
        
        return {
            "suggested_color": suggested_color,
            "contrast_ratio": f"{contrast_ratio:.2f}:1",
            "explanation": f"Suggested color {suggested_color} provides {contrast_ratio:.2f}:1 contrast ratio, meeting WCAG AA standards."
        }
    
    async def generate_aria_label(self, element_html: str, element_type: str, context: Optional[str] = None) -> str:
        """
        Generate appropriate ARIA label for an element
        
        Args:
            element_html: HTML of the element
            element_type: Type of element (button, link, etc.)
            context: Context about the element
            
        Returns:
            Generated ARIA label
        """
        # Extract text content
        text_content = re.sub(r'<[^>]+>', '', element_html).strip()
        
        # Generate label based on type and content
        if element_type == "button":
            if text_content:
                return f"Button: {text_content}"
            elif context:
                return f"Button: {context}"
            else:
                return "Button"
        
        elif element_type == "link":
            if text_content:
                return f"Link to: {text_content}"
            elif context:
                return f"Link: {context}"
            else:
                return "Link"
        
        elif element_type == "input":
            if context:
                return context
            else:
                return "Input field"
        
        return text_content or context or f"{element_type.title()} element"
    
    async def analyze_text_complexity(self, text: str) -> Dict[str, Any]:
        """
        Analyze text complexity and suggest improvements
        
        Args:
            text: Text to analyze
            
        Returns:
            Analysis results with suggestions
        """
        from .readability_scorer import ReadabilityScorer
        
        scorer = ReadabilityScorer()
        analysis = scorer.analyze(text)
        
        # Add AI-powered suggestions
        suggestions = []
        
        if analysis["flesch_reading_ease"] < 50:
            suggestions.append("Consider simplifying sentence structure and using shorter words")
            suggestions.append("Break long paragraphs into shorter ones")
            suggestions.append("Use active voice instead of passive voice")
        
        if analysis["average_words_per_sentence"] > 20:
            suggestions.append("Try to keep sentences under 20 words for better readability")
        
        analysis["suggestions"] = suggestions
        
        return analysis
    
    async def suggest_html_semantic_fix(self, element_html: str, current_tag: str) -> Dict[str, str]:
        """
        Suggest semantic HTML fix
        
        Args:
            element_html: Current HTML element
            current_tag: Current tag name
            
        Returns:
            Suggested fix with explanation
        """
        suggestions = {
            "div": {
                "if_has_onclick": {
                    "suggested_tag": "button",
                    "explanation": "Use <button> element for interactive elements. It provides built-in keyboard support and screen reader announcements."
                },
                "if_has_role_button": {
                    "suggested_tag": "button",
                    "explanation": "Instead of role='button' on a div, use the semantic <button> element directly."
                }
            },
            "span": {
                "if_has_role_button": {
                    "suggested_tag": "button",
                    "explanation": "Use <button> element instead of <span> with role='button' for better accessibility."
                },
                "if_has_role_link": {
                    "suggested_tag": "a",
                    "explanation": "Use <a> element instead of <span> with role='link' for proper link behavior."
                }
            }
        }
        
        # Check if element has onclick
        has_onclick = 'onclick=' in element_html.lower()
        has_role_button = 'role="button"' in element_html or "role='button'" in element_html
        has_role_link = 'role="link"' in element_html or "role='link'" in element_html
        
        if current_tag.lower() in suggestions:
            tag_suggestions = suggestions[current_tag.lower()]
            
            if has_onclick and "if_has_onclick" in tag_suggestions:
                return tag_suggestions["if_has_onclick"]
            elif has_role_button and "if_has_role_button" in tag_suggestions:
                return tag_suggestions["if_has_role_button"]
            elif has_role_link and "if_has_role_link" in tag_suggestions:
                return tag_suggestions["if_has_role_link"]
        
        return {
            "suggested_tag": current_tag,
            "explanation": "No semantic improvement needed"
        }

