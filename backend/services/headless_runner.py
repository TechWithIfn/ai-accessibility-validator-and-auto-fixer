"""
Headless Browser Runner Service
Uses Playwright to render pages, capture screenshots, and handle SPAs
"""

from playwright.async_api import async_playwright, Browser, Page, BrowserContext
from typing import List, Dict, Any, Optional, Tuple
import asyncio
import base64
from io import BytesIO
from PIL import Image
import json


class HeadlessRunner:
    """Runs headless browser to render pages and capture screenshots"""
    
    def __init__(self, headless: bool = True):
        self.headless = headless
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.playwright = None
    
    async def start(self):
        """Start the browser instance"""
        if not self.playwright:
            self.playwright = await async_playwright().start()
        if not self.browser:
            self.browser = await self.playwright.chromium.launch(
                headless=self.headless,
                args=['--disable-blink-features=AutomationControlled']
            )
        if not self.context:
            self.context = await self.browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )
    
    async def stop(self):
        """Stop the browser instance"""
        if self.context:
            await self.context.close()
            self.context = None
        if self.browser:
            await self.browser.close()
            self.browser = None
        if self.playwright:
            await self.playwright.stop()
            self.playwright = None
    
    async def render_page(
        self,
        url: str,
        wait_for_network_idle: bool = True,
        wait_timeout: int = 30000,
        interactions: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Render a page and capture DOM, screenshots, and metadata
        
        Args:
            url: URL to render
            wait_for_network_idle: Wait for network to be idle
            wait_timeout: Maximum wait time in milliseconds
            interactions: List of interactions to perform (scroll, click, etc.)
            
        Returns:
            Dictionary with DOM, screenshots, and metadata
        """
        if not self.context:
            await self.start()
        
        page = await self.context.new_page()
        result = {
            'url': url,
            'html': '',
            'screenshots': {},
            'dom_snapshot': {},
            'metadata': {}
        }
        
        try:
            # Navigate to page
            response = await page.goto(url, wait_until='domcontentloaded', timeout=wait_timeout)
            result['metadata']['status_code'] = response.status if response else None
            
            # Wait for network idle if requested
            if wait_for_network_idle:
                try:
                    await page.wait_for_load_state('networkidle', timeout=wait_timeout)
                except:
                    pass  # Continue even if network idle timeout
            
            # Perform interactions if specified (for SPAs and lazy content)
            if interactions:
                for interaction in interactions:
                    await self._perform_interaction(page, interaction)
            
            # Wait for any remaining dynamic content
            await asyncio.sleep(2)
            
            # Capture full page screenshot
            screenshot_full = await page.screenshot(full_page=True, type='png')
            result['screenshots']['full_page'] = base64.b64encode(screenshot_full).decode('utf-8')
            
            # Capture viewport screenshot
            screenshot_viewport = await page.screenshot(type='png')
            result['screenshots']['viewport'] = base64.b64encode(screenshot_viewport).decode('utf-8')
            
            # Get HTML content
            result['html'] = await page.content()
            
            # Get DOM snapshot
            result['dom_snapshot'] = await page.evaluate('''
                () => {
                    return {
                        title: document.title,
                        url: window.location.href,
                        viewport: {
                            width: window.innerWidth,
                            height: window.innerHeight
                        },
                        elements: document.querySelectorAll('*').length,
                        images: document.querySelectorAll('img').length,
                        links: document.querySelectorAll('a').length,
                        buttons: document.querySelectorAll('button').length,
                        inputs: document.querySelectorAll('input, textarea, select').length,
                        headings: {
                            h1: document.querySelectorAll('h1').length,
                            h2: document.querySelectorAll('h2').length,
                            h3: document.querySelectorAll('h3').length
                        }
                    }
                }
            ''')
            
            # Get all images for CV analysis
            images = await page.query_selector_all('img')
            result['metadata']['images'] = []
            for img in images:
                src = await img.get_attribute('src')
                alt = await img.get_attribute('alt')
                result['metadata']['images'].append({
                    'src': src,
                    'alt': alt,
                    'has_alt': alt is not None and alt.strip() != ''
                })
            
            # Get all links for keyboard navigation
            links = await page.query_selector_all('a')
            result['metadata']['links'] = []
            for link in links:
                href = await link.get_attribute('href')
                text = await link.inner_text()
                result['metadata']['links'].append({
                    'href': href,
                    'text': text[:100] if text else None,
                    'has_href': href is not None
                })
            
            # Get all form elements
            form_elements = await page.query_selector_all('input, textarea, select, button')
            result['metadata']['form_elements'] = []
            for elem in form_elements:
                tag = await elem.evaluate('el => el.tagName.toLowerCase()')
                elem_type = await elem.get_attribute('type')
                label = await elem.get_attribute('aria-label')
                id_attr = await elem.get_attribute('id')
                result['metadata']['form_elements'].append({
                    'tag': tag,
                    'type': elem_type,
                    'id': id_attr,
                    'has_label': label is not None or id_attr is not None
                })
            
        except Exception as e:
            result['error'] = str(e)
        finally:
            await page.close()
        
        return result
    
    async def _perform_interaction(self, page: Page, interaction: Dict[str, Any]):
        """Perform a single interaction on the page"""
        interaction_type = interaction.get('type')
        
        if interaction_type == 'scroll':
            x = interaction.get('x', 0)
            y = interaction.get('y', 0)
            await page.mouse.wheel(x, y)
            await asyncio.sleep(1)
        
        elif interaction_type == 'click':
            selector = interaction.get('selector')
            if selector:
                try:
                    await page.click(selector, timeout=5000)
                    await asyncio.sleep(1)
                except:
                    pass
        
        elif interaction_type == 'wait':
            duration = interaction.get('duration', 1000)
            await asyncio.sleep(duration / 1000)
    
    async def simulate_tab_navigation(self, url: str, max_tabs: int = 50) -> Dict[str, Any]:
        """
        Simulate tab navigation to check keyboard accessibility
        
        Args:
            url: URL to test
            max_tabs: Maximum number of tab presses
            
        Returns:
            Dictionary with tab navigation results
        """
        if not self.context:
            await self.start()
        
        page = await self.context.new_page()
        result = {
            'url': url,
            'tab_order': [],
            'focusable_elements': [],
            'issues': []
        }
        
        try:
            await page.goto(url, wait_until='networkidle')
            await asyncio.sleep(2)
            
            # Get all focusable elements
            focusable_elements = await page.evaluate('''
                () => {
                    const selectors = [
                        'a[href]',
                        'button:not([disabled])',
                        'input:not([disabled])',
                        'select:not([disabled])',
                        'textarea:not([disabled])',
                        '[tabindex]:not([tabindex="-1"])',
                        '[contenteditable="true"]'
                    ];
                    
                    const elements = [];
                    selectors.forEach(selector => {
                        document.querySelectorAll(selector).forEach(el => {
                            elements.push({
                                tag: el.tagName.toLowerCase(),
                                id: el.id || null,
                                class: el.className || null,
                                text: el.textContent?.trim().substring(0, 50) || null,
                                hasFocusVisible: window.getComputedStyle(el, ':focus-visible') !== null,
                                tabIndex: el.tabIndex
                            });
                        });
                    });
                    return elements;
                }
            ''')
            
            result['focusable_elements'] = focusable_elements
            
            # Simulate tab navigation
            tab_order = []
            for i in range(min(max_tabs, len(focusable_elements))):
                await page.keyboard.press('Tab')
                await asyncio.sleep(0.1)
                
                focused_element = await page.evaluate('''
                    () => {
                        const el = document.activeElement;
                        if (el && el !== document.body) {
                            return {
                                tag: el.tagName.toLowerCase(),
                                id: el.id || null,
                                text: el.textContent?.trim().substring(0, 50) || null,
                                hasFocusVisible: window.getComputedStyle(el).outline !== 'none' || 
                                                window.getComputedStyle(el).outlineWidth !== '0px'
                            };
                        }
                        return null;
                    }
                ''')
                
                if focused_element:
                    tab_order.append({
                        'index': i,
                        'element': focused_element
                    })
                
                # Check if we've cycled back
                if i > 0 and focused_element and tab_order[0]['element'] == focused_element:
                    break
            
            result['tab_order'] = tab_order
            
            # Check for issues
            # 1. Check for missing focus indicators
            for elem in focusable_elements:
                if not elem.get('hasFocusVisible'):
                    result['issues'].append({
                        'type': 'missing_focus_indicator',
                        'element': elem,
                        'severity': 'medium',
                        'message': 'Focusable element lacks visible focus indicator'
                    })
            
            # 2. Check for tab order issues (elements with tabindex > 0)
            for elem in focusable_elements:
                if elem.get('tabIndex', 0) > 0:
                    result['issues'].append({
                        'type': 'tab_order_issue',
                        'element': elem,
                        'severity': 'medium',
                        'message': 'Element has positive tabindex which can disrupt natural tab order'
                    })
        
        except Exception as e:
            result['error'] = str(e)
        finally:
            await page.close()
        
        return result
    
    async def capture_element_screenshot(
        self,
        url: str,
        selector: str,
        padding: int = 10
    ) -> Optional[str]:
        """Capture screenshot of a specific element"""
        if not self.context:
            await self.start()
        
        page = await self.context.new_page()
        try:
            await page.goto(url, wait_until='networkidle')
            element = await page.query_selector(selector)
            
            if element:
                screenshot = await element.screenshot(type='png')
                return base64.b64encode(screenshot).decode('utf-8')
        except:
            pass
        finally:
            await page.close()
        
        return None

