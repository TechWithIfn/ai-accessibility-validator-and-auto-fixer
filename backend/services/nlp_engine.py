"""
NLP/LLM Engine Service
Generates alt text, labels, and simplified content using AI/LLM
"""

from typing import List, Dict, Any, Optional
import os
from openai import AsyncOpenAI
from PIL import Image
import base64
from io import BytesIO


class NPLEngine:
    """NLP/LLM engine for generating alt text and labels"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv('OPENAI_API_KEY')
        self.client = AsyncOpenAI(api_key=self.api_key) if self.api_key else None
        self.enabled = self.client is not None
    
    async def generate_alt_text(
        self,
        image_b64: str,
        context: Optional[str] = None,
        language: str = 'en'
    ) -> Dict[str, Any]:
        """
        Generate alt text for an image using AI/LLM
        
        Args:
            image_b64: Base64 encoded image
            context: Optional surrounding context (page title, nearby text, etc.)
            language: Target language code
            
        Returns:
            Dictionary with alt text and confidence score
        """
        if not self.enabled:
            # Fallback to rule-based generation
            return {
                'alt_text': 'Decorative image',
                'confidence': 0.3,
                'method': 'rule_based',
                'reasoning': 'AI service not available'
            }
        
        try:
            # Decode image
            image_bytes = base64.b64decode(image_b64)
            image = Image.open(BytesIO(image_bytes))
            
            # Prepare prompt
            prompt = "Generate a concise, descriptive alt text for this image. "
            if context:
                prompt += f"Context: {context[:200]}. "
            prompt += "The alt text should be informative and concise (under 125 characters)."
            
            # Use GPT-4 Vision or similar
            response = await self.client.chat.completions.create(
                model="gpt-4-vision-preview",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{image_b64}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=150
            )
            
            alt_text = response.choices[0].message.content.strip()
            
            # Clean up alt text (remove quotes, limit length)
            alt_text = alt_text.replace('"', '').replace("'", '')
            if len(alt_text) > 125:
                alt_text = alt_text[:122] + '...'
            
            return {
                'alt_text': alt_text,
                'confidence': 0.85,
                'method': 'gpt4_vision',
                'reasoning': 'AI-generated alt text based on image content and context'
            }
        
        except Exception as e:
            # Fallback to rule-based
            return {
                'alt_text': self._generate_rule_based_alt_text(context),
                'confidence': 0.3,
                'method': 'rule_based',
                'reasoning': f'AI generation failed: {str(e)}'
            }
    
    def _generate_rule_based_alt_text(self, context: Optional[str]) -> str:
        """Generate basic alt text using rules"""
        if context:
            # Extract relevant keywords from context
            context_lower = context.lower()
            if 'logo' in context_lower or 'brand' in context_lower:
                return 'Company logo'
            elif 'button' in context_lower or 'click' in context_lower:
                return 'Interactive button'
            elif 'icon' in context_lower:
                return 'Icon'
            elif 'photo' in context_lower or 'image' in context_lower:
                return 'Image'
        
        return 'Decorative image'
    
    async def generate_label_suggestion(
        self,
        element_type: str,
        context: Optional[str] = None,
        placeholder: Optional[str] = None,
        nearby_text: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate label suggestion for form elements
        
        Args:
            element_type: Type of form element (input, textarea, select, etc.)
            context: Optional surrounding context
            placeholder: Optional placeholder text
            nearby_text: Optional nearby text that might be a label
            
        Returns:
            Dictionary with label suggestion and confidence
        """
        if not self.enabled:
            return {
                'label': self._generate_rule_based_label(element_type, placeholder, nearby_text),
                'confidence': 0.4,
                'method': 'rule_based'
            }
        
        try:
            prompt = f"Generate an accessible label for a {element_type} form element. "
            if placeholder:
                prompt += f"Placeholder text: {placeholder}. "
            if nearby_text:
                prompt += f"Nearby text: {nearby_text}. "
            if context:
                prompt += f"Context: {context[:200]}. "
            prompt += "The label should be concise, descriptive, and follow accessibility best practices."
            
            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "user", "content": prompt}
                ],
                max_tokens=100
            )
            
            label = response.choices[0].message.content.strip()
            
            return {
                'label': label.replace('"', '').replace("'", ''),
                'confidence': 0.8,
                'method': 'gpt_3.5',
                'reasoning': 'AI-generated label based on context'
            }
        
        except Exception as e:
            return {
                'label': self._generate_rule_based_label(element_type, placeholder, nearby_text),
                'confidence': 0.4,
                'method': 'rule_based',
                'reasoning': f'AI generation failed: {str(e)}'
            }
    
    def _generate_rule_based_label(
        self,
        element_type: str,
        placeholder: Optional[str],
        nearby_text: Optional[str]
    ) -> str:
        """Generate basic label using rules"""
        if nearby_text:
            return nearby_text.strip()
        if placeholder:
            return placeholder.strip().capitalize()
        return f"{element_type.replace('input-', '').title()} field"
    
    async def simplify_content(
        self,
        text: str,
        target_reading_level: str = 'grade_8'
    ) -> Dict[str, Any]:
        """
        Simplify complex content for better readability
        
        Args:
            text: Text to simplify
            target_reading_level: Target reading level
            
        Returns:
            Dictionary with simplified text and metrics
        """
        if not self.enabled or len(text) < 50:
            return {
                'simplified_text': text,
                'confidence': 0.3,
                'method': 'no_change',
                'reasoning': 'Content too short or AI not available'
            }
        
        try:
            prompt = f"Simplify the following text to a {target_reading_level} reading level while maintaining the core meaning. Make it more accessible and easier to understand: {text[:500]}"
            
            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "user", "content": prompt}
                ],
                max_tokens=600
            )
            
            simplified = response.choices[0].message.content.strip()
            
            return {
                'simplified_text': simplified,
                'confidence': 0.75,
                'method': 'gpt_3.5',
                'original_length': len(text),
                'simplified_length': len(simplified),
                'reasoning': 'AI-simplified content for better readability'
            }
        
        except Exception as e:
            return {
                'simplified_text': text,
                'confidence': 0.3,
                'method': 'no_change',
                'reasoning': f'Simplification failed: {str(e)}'
            }
    
    async def analyze_image_accessibility(
        self,
        image_b64: str,
        current_alt: Optional[str] = None,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Comprehensive image accessibility analysis
        
        Args:
            image_b64: Base64 encoded image
            current_alt: Current alt text (if any)
            context: Optional context
            
        Returns:
            Dictionary with analysis results and recommendations
        """
        result = {
            'has_alt': current_alt is not None and current_alt.strip() != '',
            'current_alt': current_alt,
            'recommendations': []
        }
        
        # Check if alt text is missing
        if not result['has_alt']:
            generated = await self.generate_alt_text(image_b64, context)
            result['recommended_alt'] = generated['alt_text']
            result['recommendations'].append({
                'type': 'missing_alt_text',
                'severity': 'high',
                'message': 'Image is missing alt text',
                'recommendation': generated['alt_text'],
                'confidence': generated['confidence']
            })
        
        # Check if alt text is too long
        elif current_alt and len(current_alt) > 125:
            result['recommendations'].append({
                'type': 'alt_text_too_long',
                'severity': 'medium',
                'message': f'Alt text is {len(current_alt)} characters (recommended: <125)',
                'recommendation': current_alt[:122] + '...'
            })
        
        # Check if alt text is not descriptive
        elif current_alt and current_alt.lower() in ['image', 'photo', 'picture', 'img']:
            generated = await self.generate_alt_text(image_b64, context)
            result['recommendations'].append({
                'type': 'alt_text_not_descriptive',
                'severity': 'medium',
                'message': 'Alt text is not descriptive',
                'recommendation': generated['alt_text'],
                'confidence': generated['confidence']
            })
        
        return result

