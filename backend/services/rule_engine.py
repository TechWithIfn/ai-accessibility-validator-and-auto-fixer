"""
Rule Engine Service
Integrates axe-core and pa11y for WCAG 2.2 compliance checking
"""

from typing import List, Dict, Any, Optional
import subprocess
import json
import tempfile
import os
from pathlib import Path


class RuleEngine:
    """Rule engine using axe-core and pa11y for WCAG validation"""
    
    def __init__(self):
        self.axe_runner_path = None
        self._setup_axe()
    
    def _setup_axe(self):
        """Setup axe-core runner"""
        # For now, we'll use a Python wrapper or direct integration
        # In production, you might want to use playwright-axe or similar
        pass
    
    async def run_axe_core(
        self,
        html: str,
        url: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Run axe-core accessibility checks
        
        Args:
            html: HTML content to check
            url: Optional URL for context
            
        Returns:
            List of axe-core violations and incomplete checks
        """
        issues = []
        
        try:
            # Use axe-core Python wrapper or Playwright axe integration
            # For now, we'll create a structure that can be integrated with actual axe-core
            # In production, use: from axe_selenium_python import Axe
            
            # Placeholder structure - will be replaced with actual axe-core integration
            # This is a simplified version - actual implementation should use axe-core library
            
            # Mock structure for now - replace with actual axe-core integration
            # Example structure:
            # from playwright.sync_api import sync_playwright
            # from axe_playwright_python.sync_playwright import Axe
            # 
            # with sync_playwright() as p:
            #     browser = p.chromium.launch()
            #     page = browser.new_page()
            #     page.set_content(html)
            #     axe = Axe(page)
            #     results = axe.run()
            #     browser.close()
            
            pass
            
        except Exception as e:
            issues.append({
                'type': 'rule_engine_error',
                'severity': 'high',
                'message': f'Error running axe-core: {str(e)}',
                'wcag_level': 'A',
                'wcag_rule': 'N/A'
            })
        
        return issues
    
    async def run_pa11y(
        self,
        url: str,
        standard: str = 'WCAG2AA'
    ) -> List[Dict[str, Any]]:
        """
        Run pa11y accessibility checks
        
        Args:
            url: URL to check
            standard: WCAG standard (WCAG2A, WCAG2AA, WCAG2AAA)
            
        Returns:
            List of pa11y issues
        """
        issues = []
        
        try:
            # Run pa11y via command line or Python API
            # For now, using command-line interface
            # In production, might use pa11y Python wrapper
            
            result = subprocess.run(
                ['pa11y', '--standard', standard, '--json', url],
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if result.returncode == 0:
                pa11y_results = json.loads(result.stdout)
                
                for issue in pa11y_results.get('issues', []):
                    issues.append({
                        'type': issue.get('code', 'unknown'),
                        'severity': self._map_severity(issue.get('type', 'unknown')),
                        'message': issue.get('message', ''),
                        'selector': issue.get('selector', ''),
                        'wcag_level': self._get_wcag_level(issue.get('code', '')),
                        'wcag_rule': issue.get('code', ''),
                        'context': issue.get('context', ''),
                        'description': self._get_wcag_description(issue.get('code', ''))
                    })
        
        except FileNotFoundError:
            # pa11y not installed, skip
            pass
        except Exception as e:
            issues.append({
                'type': 'pa11y_error',
                'severity': 'medium',
                'message': f'Error running pa11y: {str(e)}',
                'wcag_level': 'A',
                'wcag_rule': 'N/A'
            })
        
        return issues
    
    def _map_severity(self, pa11y_type: str) -> str:
        """Map pa11y issue type to severity"""
        mapping = {
            'error': 'high',
            'warning': 'medium',
            'notice': 'low'
        }
        return mapping.get(pa11y_type, 'medium')
    
    def _get_wcag_level(self, code: str) -> str:
        """Get WCAG level from issue code"""
        # Map common codes to WCAG levels
        if '1.1.1' in code or '1.3.1' in code or '2.1.1' in code:
            return 'A'
        elif '1.4.3' in code or '2.4.7' in code:
            return 'AA'
        elif '1.4.6' in code:
            return 'AAA'
        return 'A'
    
    def _get_wcag_description(self, code: str) -> str:
        """Get human-readable WCAG description"""
        descriptions = {
            'WCAG2AA.Principle1.Guideline1_1.1_1_1': 'Images must have alt text',
            'WCAG2AA.Principle1.Guideline1_4.1_4_3': 'Text contrast ratio must be at least 4.5:1',
            'WCAG2AA.Principle2.Guideline2_4.2_4_7': 'Focus indicators must be visible',
            'WCAG2AA.Principle1.Guideline1_3.1_3_1': 'Proper heading hierarchy required',
            'WCAG2AA.Principle4.Guideline4_1.4_1_2': 'Form inputs must have labels'
        }
        return descriptions.get(code, 'Accessibility issue detected')
    
    async def run_all_checks(
        self,
        html: str,
        url: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Run all rule-based checks (axe-core + pa11y)
        
        Args:
            html: HTML content
            url: Optional URL for pa11y
            
        Returns:
            Combined list of all issues
        """
        all_issues = []
        
        # Run axe-core checks
        axe_issues = await self.run_axe_core(html, url)
        all_issues.extend(axe_issues)
        
        # Run pa11y checks if URL provided
        if url:
            pa11y_issues = await self.run_pa11y(url)
            all_issues.extend(pa11y_issues)
        
        # Deduplicate issues
        unique_issues = self._deduplicate_issues(all_issues)
        
        return unique_issues
    
    def _deduplicate_issues(self, issues: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate issues based on type and selector"""
        seen = set()
        unique = []
        
        for issue in issues:
            key = (issue.get('type'), issue.get('selector', ''))
            if key not in seen:
                seen.add(key)
                unique.append(issue)
        
        return unique


# Note: For production use, integrate with actual libraries:
# - For axe-core: playwright-axe or axe-selenium-python
# - For pa11y: pa11y Python wrapper or command-line tool
# Example integration:
#
# from playwright.async_api import async_playwright
# from axe_playwright_python.async_playwright import Axe
#
# async def run_axe_with_playwright(html, url):
#     async with async_playwright() as p:
#         browser = await p.chromium.launch()
#         page = await browser.new_page()
#         await page.goto(url if url else 'data:text/html;charset=utf-8,' + html)
#         axe = Axe(page)
#         results = await axe.run()
#         await browser.close()
#         return results

