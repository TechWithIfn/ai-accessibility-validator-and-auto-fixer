// Popup script for AI Accessibility Validator extension

const API_BASE_URL = 'http://localhost:8000'; // Update with your backend URL

document.addEventListener('DOMContentLoaded', () => {
  const scanButton = document.getElementById('scanButton');
  const status = document.getElementById('status');
  const results = document.getElementById('results');
  const issueCount = document.getElementById('issueCount');
  const score = document.getElementById('score');
  const viewIssuesButton = document.getElementById('viewIssuesButton');

  // Scan button click handler
  scanButton.addEventListener('click', async () => {
    try {
      scanButton.disabled = true;
      status.className = 'status loading';
      status.textContent = 'Scanning page...';
      status.classList.remove('hidden');
      results.classList.add('hidden');

      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab || !tab.url) {
        throw new Error('Could not get current tab');
      }

      // Execute content script to get page HTML
      const [{ result: pageContent }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          return {
            html: document.documentElement.outerHTML,
            url: window.location.href
          };
        }
      });

      // Send to backend API
      const response = await fetch(`${API_BASE_URL}/scan-html`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: pageContent.html,
          url: pageContent.url
        })
      });

      if (!response.ok) {
        throw new Error('Failed to scan page');
      }

      const data = await response.json();

      // Show results
      issueCount.textContent = data.total_issues;
      score.textContent = Math.round(data.score);
      
      status.classList.add('hidden');
      results.classList.remove('hidden');

      // Store results for content script
      await chrome.storage.local.set({
        scanResults: data,
        scanTimestamp: Date.now()
      });

      // Send message to content script to show sidebar
      chrome.tabs.sendMessage(tab.id, {
        action: 'showResults',
        results: data
      });

    } catch (error) {
      console.error('Scan error:', error);
      status.className = 'status error';
      status.textContent = `Error: ${error.message}`;
      status.classList.remove('hidden');
    } finally {
      scanButton.disabled = false;
    }
  });

  // View issues button
  viewIssuesButton.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'showSidebar'
        });
        window.close();
      }
    });
  });

  // Check if there are stored results
  chrome.storage.local.get(['scanResults', 'scanTimestamp'], (data) => {
    if (data.scanResults && data.scanTimestamp) {
      const timeSinceScan = Date.now() - data.scanTimestamp;
      // Show results if scan was within last 5 minutes
      if (timeSinceScan < 5 * 60 * 1000) {
        issueCount.textContent = data.scanResults.total_issues;
        score.textContent = Math.round(data.scanResults.score);
        results.classList.remove('hidden');
      }
    }
  });
});

