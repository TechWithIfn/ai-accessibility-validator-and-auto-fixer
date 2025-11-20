# AI Accessibility Validator Browser Extension

## Installation

1. Open Chrome/Edge and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension` folder from this project
5. The extension icon should appear in your toolbar

## Usage

1. Click the extension icon in your toolbar
2. Click "Scan This Page" to scan the current page
3. View issues in the sidebar that appears
4. Click "Highlight Element" to see where issues are on the page
5. Click "Apply Fix" to automatically fix issues (preview mode)

## Features

- **Scan Any Page**: Scan any webpage for accessibility issues
- **Real-time Highlighting**: See exactly where issues are on the page
- **One-click Fixes**: Apply AI-generated fixes with a single click
- **Sidebar UI**: Clean, accessible sidebar for viewing and managing issues
- **Backend Integration**: Connects to FastAPI backend for scanning and fixing

## Configuration

Update `popup.js` and `content.js` to change the `API_BASE_URL` if your backend is hosted elsewhere.

## Permissions

- `activeTab`: To scan the current tab
- `storage`: To save scan results
- `scripting`: To inject content scripts
- `<all_urls>`: To scan any website

