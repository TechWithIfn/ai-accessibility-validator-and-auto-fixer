"""
Context Fusion Module
Merges DOM, CV, and NLP results to prioritize issues and generate context-aware fixes
"""

from typing import List, Dict, Any, Optional
from collections import defaultdict
import json


class ContextFusion:
    """Fuses multiple detection results to create prioritized, context-aware fixes"""
    
    def __init__(self):
        self.priority_weights = {
            'high': 3,
            'medium': 2,
            'low': 1
        }
        self.wcag_level_weights = {
            'A': 3,
            'AA': 2,
            'AAA': 1
        }
    
    def fuse_results(
        self,
        dom_issues: List[Dict[str, Any]],
        cv_issues: List[Dict[str, Any]],
        nlp_results: List[Dict[str, Any]],
        metadata: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Merge DOM, CV, and NLP results into prioritized, context-aware issues
        
        Args:
            dom_issues: Issues from DOM/rule-based checks (axe-core, pa11y)
            cv_issues: Issues from computer vision analysis
            nlp_results: Results from NLP/LLM analysis
            metadata: Optional metadata about page elements
            
        Returns:
            Fused list of issues with priorities and context
        """
        # Group issues by type and element
        grouped_issues = defaultdict(list)
        
        # Add DOM issues
        for issue in dom_issues:
            key = self._get_issue_key(issue)
            grouped_issues[key].append({
                'source': 'dom',
                'issue': issue
            })
        
        # Add CV issues
        for issue in cv_issues:
            key = self._get_issue_key(issue)
            grouped_issues[key].append({
                'source': 'cv',
                'issue': issue
            })
        
        # Add NLP results
        for result in nlp_results:
            if 'issue' in result:
                key = self._get_issue_key(result['issue'])
                grouped_issues[key].append({
                    'source': 'nlp',
                    'issue': result['issue'],
                    'suggestion': result.get('suggestion'),
                    'confidence': result.get('confidence', 0.5)
                })
        
        # Merge grouped issues
        fused_issues = []
        for key, group in grouped_issues.items():
            fused = self._merge_issue_group(group, metadata)
            if fused:
                fused_issues.append(fused)
        
        # Prioritize issues
        prioritized = self._prioritize_issues(fused_issues)
        
        # Add context-aware recommendations
        enhanced = self._add_context_aware_recommendations(prioritized, metadata)
        
        return enhanced
    
    def _get_issue_key(self, issue: Dict[str, Any]) -> str:
        """Generate a unique key for grouping similar issues"""
        issue_type = issue.get('type', 'unknown')
        selector = issue.get('selector', '')
        element_id = issue.get('element_id', '')
        
        # Create key from type and element identifier
        if selector:
            return f"{issue_type}:{selector}"
        elif element_id:
            return f"{issue_type}:{element_id}"
        else:
            return f"{issue_type}:general"
    
    def _merge_issue_group(
        self,
        group: List[Dict[str, Any]],
        metadata: Optional[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        """Merge multiple detections of the same issue"""
        if not group:
            return None
        
        # Get base issue from first detection
        base_issue = group[0]['issue'].copy()
        
        # Determine confidence based on multiple sources
        sources = [item['source'] for item in group]
        confidence = self._calculate_confidence(group)
        
        # Get highest severity
        severities = [item['issue'].get('severity', 'medium') for item in group]
        severity_weights = [self.priority_weights.get(s, 1) for s in severities]
        max_severity_idx = severity_weights.index(max(severity_weights))
        base_issue['severity'] = severities[max_severity_idx]
        
        # Get highest WCAG level
        wcag_levels = [item['issue'].get('wcag_level', 'A') for item in group]
        wcag_weights = [self.wcag_level_weights.get(l, 1) for l in wcag_levels]
        max_wcag_idx = wcag_weights.index(max(wcag_weights))
        base_issue['wcag_level'] = wcag_levels[max_wcag_idx]
        
        # Combine descriptions
        descriptions = [item['issue'].get('description', '') for item in group]
        base_issue['description'] = self._combine_descriptions(descriptions)
        
        # Add detection sources
        base_issue['detection_sources'] = list(set(sources))
        base_issue['detection_count'] = len(group)
        base_issue['confidence'] = confidence
        
        # Add NLP suggestions if available
        nlp_items = [item for item in group if item['source'] == 'nlp' and 'suggestion' in item]
        if nlp_items:
            base_issue['ai_suggestion'] = nlp_items[0].get('suggestion')
            base_issue['ai_confidence'] = nlp_items[0].get('confidence', 0.5)
        
        # Add context from metadata
        if metadata:
            base_issue['context'] = self._extract_context(base_issue, metadata)
        
        return base_issue
    
    def _calculate_confidence(self, group: List[Dict[str, Any]]) -> float:
        """Calculate confidence score based on multiple detections"""
        # Higher confidence when detected by multiple sources
        source_weights = {
            'dom': 1.0,
            'cv': 0.8,
            'nlp': 0.7
        }
        
        total_weight = sum(source_weights.get(item['source'], 0.5) for item in group)
        max_possible = len(group) * 1.0
        
        # Base confidence from source agreement
        source_confidence = min(total_weight / max_possible, 1.0)
        
        # Boost confidence for multiple detections
        detection_boost = min(len(group) * 0.1, 0.3)
        
        # Add individual confidences if available
        individual_confidences = [
            item.get('confidence', 0.5) for item in group
            if 'confidence' in item
        ]
        if individual_confidences:
            avg_confidence = sum(individual_confidences) / len(individual_confidences)
            source_confidence = (source_confidence + avg_confidence) / 2
        
        return min(source_confidence + detection_boost, 1.0)
    
    def _combine_descriptions(self, descriptions: List[str]) -> str:
        """Combine multiple descriptions into one"""
        # Remove duplicates and empty strings
        unique = [d for d in descriptions if d and d.strip()]
        if not unique:
            return 'Accessibility issue detected'
        
        if len(unique) == 1:
            return unique[0]
        
        # Combine descriptions, removing redundancy
        combined = unique[0]
        for desc in unique[1:]:
            if desc not in combined and combined not in desc:
                combined += f" {desc}"
        
        return combined[:500]  # Limit length
    
    def _extract_context(
        self,
        issue: Dict[str, Any],
        metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Extract relevant context from metadata"""
        context = {
            'page_url': metadata.get('url'),
            'element_count': metadata.get('elements', {}).get('total', 0)
        }
        
        # Add element-specific context
        selector = issue.get('selector', '')
        if selector and 'form_elements' in metadata:
            # Check if it's a form element
            for elem in metadata.get('form_elements', []):
                if elem.get('id') in selector or elem.get('class') in selector:
                    context['element_type'] = elem.get('tag')
                    context['element_id'] = elem.get('id')
                    break
        
        return context
    
    def _prioritize_issues(
        self,
        issues: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Sort issues by priority"""
        def calculate_priority(issue):
            severity_weight = self.priority_weights.get(issue.get('severity', 'medium'), 1)
            wcag_weight = self.wcag_level_weights.get(issue.get('wcag_level', 'A'), 1)
            confidence = issue.get('confidence', 0.5)
            
            # Priority score: severity + WCAG level + confidence
            priority_score = (severity_weight * 10) + (wcag_weight * 5) + (confidence * 3)
            return priority_score
        
        sorted_issues = sorted(issues, key=calculate_priority, reverse=True)
        
        # Add priority rank
        for i, issue in enumerate(sorted_issues):
            issue['priority_rank'] = i + 1
        
        return sorted_issues
    
    def _add_context_aware_recommendations(
        self,
        issues: List[Dict[str, Any]],
        metadata: Optional[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Add context-aware fix recommendations"""
        for issue in issues:
            issue_type = issue.get('type', '')
            
            # Generate context-aware recommendations
            recommendation = self._generate_recommendation(issue, metadata)
            if recommendation:
                issue['recommended_fix'] = recommendation
                issue['fix_confidence'] = recommendation.get('confidence', 0.7)
        
        return issues
    
    def _generate_recommendation(
        self,
        issue: Dict[str, Any],
        metadata: Optional[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        """Generate context-aware fix recommendation"""
        issue_type = issue.get('type', '')
        context = issue.get('context', {})
        
        recommendations = {
            'missing_alt_text': {
                'action': 'add_alt_attribute',
                'code': '<img src="..." alt="[AI-generated description]" />',
                'explanation': 'Add descriptive alt text to image',
                'confidence': 0.9
            },
            'missing_focus_indicator': {
                'action': 'add_focus_styles',
                'code': '*:focus-visible { outline: 2px solid #0066cc; outline-offset: 2px; }',
                'explanation': 'Add visible focus indicator for keyboard navigation',
                'confidence': 0.85
            },
            'low_contrast': {
                'action': 'increase_contrast',
                'code': 'color: #000000; background-color: #ffffff; /* 21:1 contrast */',
                'explanation': 'Increase color contrast to meet WCAG AA (4.5:1) or AAA (7:1)',
                'confidence': 0.8
            },
            'missing_label': {
                'action': 'add_label',
                'code': '<label for="input-id">Field Name</label><input id="input-id" />',
                'explanation': 'Add accessible label for form input',
                'confidence': 0.9
            },
            'improper_semantics': {
                'action': 'fix_semantics',
                'code': '<button type="button">Click me</button>',
                'explanation': 'Use semantic HTML elements instead of generic divs',
                'confidence': 0.85
            }
        }
        
        # Get base recommendation
        base_rec = recommendations.get(issue_type, {})
        
        if not base_rec:
            # Try partial match
            for key, rec in recommendations.items():
                if key in issue_type.lower():
                    base_rec = rec
                    break
        
        if base_rec:
            # Enhance with context
            if 'ai_suggestion' in issue:
                base_rec['ai_suggestion'] = issue['ai_suggestion']
                base_rec['confidence'] = issue.get('ai_confidence', base_rec.get('confidence', 0.7))
            
            return base_rec
        
        return None

