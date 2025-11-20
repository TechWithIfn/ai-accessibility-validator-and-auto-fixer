// Content script for AI Accessibility Validator extension

let sidebarVisible = false;
let scanResults = null;
let highlightedElements = [];

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'showSidebar') {
    showSidebar();
    sendResponse({ success: true });
  } else if (message.action === 'showResults') {
    scanResults = message.results;
    showSidebar();
    highlightIssues(message.results);
    sendResponse({ success: true });
  } else if (message.action === 'hideSidebar') {
    hideSidebar();
    sendResponse({ success: true });
  } else if (message.action === 'applyFix') {
    applyFix(message.issueId);
    sendResponse({ success: true });
  }
  return true; // Keep channel open for async response
});

// Show sidebar
function showSidebar() {
  if (sidebarVisible) return;

  // Check if sidebar already exists
  let sidebar = document.getElementById('a11y-sidebar');
  if (sidebar) {
    sidebar.style.display = 'block';
    sidebarVisible = true;
    return;
  }

  // Create sidebar
  sidebar = document.createElement('div');
  sidebar.id = 'a11y-sidebar';
  sidebar.innerHTML = `
    <div class="a11y-sidebar-header">
      <h2>Accessibility Issues</h2>
      <button id="a11y-close" class="a11y-close-btn" aria-label="Close sidebar">×</button>
    </div>
    <div class="a11y-sidebar-content" id="a11y-content">
      <div class="a11y-loading">Loading issues...</div>
    </div>
  `;
  
  document.body.appendChild(sidebar);
  sidebarVisible = true;

  // Close button handler
  document.getElementById('a11y-close').addEventListener('click', hideSidebar);

  // Load issues
  loadIssues();
}

// Hide sidebar
function hideSidebar() {
  const sidebar = document.getElementById('a11y-sidebar');
  if (sidebar) {
    sidebar.style.display = 'none';
    sidebarVisible = false;
    removeHighlights();
  }
}

// Load issues from storage or scan results
async function loadIssues() {
  const content = document.getElementById('a11y-content');
  
  if (!content) return;

  // Get results from storage
  const data = await chrome.storage.local.get(['scanResults']);
  const results = scanResults || data.scanResults;

  if (!results || !results.issues) {
    content.innerHTML = '<div class="a11y-message">No issues found. Run a scan first.</div>';
    return;
  }

  // Render issues
  const issuesHtml = results.issues.map((issue, index) => `
    <div class="a11y-issue" data-issue-id="${issue.id || index}">
      <div class="a11y-issue-header">
        <span class="a11y-severity a11y-severity-${issue.severity || 'medium'}">
          ${(issue.severity || 'medium').toUpperCase()}
        </span>
        <span class="a11y-wcag">WCAG ${issue.wcag_level || 'A'} - ${issue.wcag_rule || ''}</span>
      </div>
      <h3 class="a11y-issue-title">${escapeHtml(issue.message || 'Accessibility issue')}</h3>
      <p class="a11y-issue-description">${escapeHtml(issue.description || '')}</p>
      ${issue.fix_suggestion ? `<p class="a11y-fix-suggestion">Fix: ${escapeHtml(issue.fix_suggestion)}</p>` : ''}
      ${issue.selector ? `<p class="a11y-selector">Selector: <code>${escapeHtml(issue.selector)}</code></p>` : ''}
      <button class="a11y-apply-fix" data-issue-id="${issue.id || index}">
        Apply Fix
      </button>
      <button class="a11y-highlight" data-issue-id="${issue.id || index}">
        Highlight Element
      </button>
    </div>
  `).join('');

  content.innerHTML = `
    <div class="a11y-summary">
      <div class="a11y-stat">
        <span class="a11y-stat-label">Total Issues</span>
        <span class="a11y-stat-value">${results.total_issues || 0}</span>
      </div>
      <div class="a11y-stat">
        <span class="a11y-stat-label">Score</span>
        <span class="a11y-stat-value">${Math.round(results.score || 100)}/100</span>
      </div>
      <div class="a11y-stat">
        <span class="a11y-stat-label">WCAG Level</span>
        <span class="a11y-stat-value">${results.wcag_level || 'N/A'}</span>
      </div>
    </div>
    <div class="a11y-issues-list">
      ${issuesHtml}
    </div>
  `;

  // Add event listeners
  document.querySelectorAll('.a11y-apply-fix').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const issueId = e.target.getAttribute('data-issue-id');
      applyFix(issueId);
    });
  });

  document.querySelectorAll('.a11y-highlight').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const issueId = e.target.getAttribute('data-issue-id');
      highlightIssue(issueId);
    });
  });

  document.querySelectorAll('.a11y-issue').forEach(issueEl => {
    issueEl.addEventListener('mouseenter', () => {
      const issueId = issueEl.getAttribute('data-issue-id');
      highlightIssue(issueId);
    });
    issueEl.addEventListener('mouseleave', () => {
      removeHighlights();
    });
  });
}

// Highlight issue on page
function highlightIssue(issueId) {
  removeHighlights();
  
  const data = scanResults || {};
  const issue = data.issues?.find(i => (i.id || data.issues.indexOf(i).toString()) === issueId);
  
  if (!issue || !issue.selector) return;

  try {
    const elements = document.querySelectorAll(issue.selector);
    elements.forEach(el => {
      el.classList.add('a11y-highlighted');
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  } catch (e) {
    console.error('Could not highlight element:', e);
  }
}

// Highlight all issues
function highlightIssues(results) {
  scanResults = results;
  // Highlighting is done on hover, but we could highlight all here
}

// Remove highlights
function removeHighlights() {
  document.querySelectorAll('.a11y-highlighted').forEach(el => {
    el.classList.remove('a11y-highlighted');
  });
}

// Apply fix for an issue
async function applyFix(issueId) {
  const data = scanResults || {};
  const issue = data.issues?.find(i => (i.id || data.issues.indexOf(i).toString()) === issueId);
  
  if (!issue) {
    alert('Issue not found');
    return;
  }

  try {
    // Call backend API to get fix
    const response = await fetch('http://localhost:8000/auto-fix', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        issue_id: issueId,
        element_selector: issue.selector || '',
        issue_type: issue.type || '',
        original_code: issue.element || ''
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get fix');
    }

    const fixData = await response.json();
    
    // Apply fix to DOM (simplified - would need proper DOM manipulation)
    if (issue.selector) {
      try {
        const element = document.querySelector(issue.selector);
        if (element && fixData.fixed_code) {
          // This is a simplified fix application
          // In production, you'd parse the fixed_code and apply it properly
          const temp = document.createElement('div');
          temp.innerHTML = fixData.fixed_code;
          const fixedElement = temp.firstElementChild;
          
          if (fixedElement) {
            element.outerHTML = fixedElement.outerHTML;
            alert('Fix applied! ' + fixData.explanation);
            // Reload sidebar
            loadIssues();
          }
        }
      } catch (e) {
        console.error('Could not apply fix:', e);
        alert('Could not apply fix to element. Check console for details.');
      }
    }
  } catch (error) {
    console.error('Apply fix error:', error);
    alert('Failed to apply fix: ' + error.message);
  }
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

