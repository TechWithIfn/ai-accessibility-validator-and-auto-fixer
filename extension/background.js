// Background service worker for AI Accessibility Validator extension

// Install handler
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Accessibility Validator extension installed');
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'logScan') {
    // Log scan activity (could save to storage)
    console.log('Scan performed:', message.url);
    sendResponse({ success: true });
  }
  return true;
});

// Context menu (optional - for right-click scanning)
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'scanPage',
    title: 'Scan this page for accessibility issues',
    contexts: ['page']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'scanPage' && tab) {
    chrome.tabs.sendMessage(tab.id, { action: 'showSidebar' });
  }
});

