# AI Web Accessibility Validator & Auto-Fixer

A complete system that scans any website URL, detects accessibility issues (WCAG 2.2), and automatically generates fixes with AI-powered explanations.

## 🎯 Features

- **AI-Powered Scanning**: Comprehensive accessibility analysis using AI and computer vision
- **WCAG 2.2 Compliance**: Checks for Level A, AA, and AAA compliance
- **Auto-Fix Generation**: Automatically generates code fixes with explanations
- **Browser Extension**: Scan pages directly from your browser
- **Developer Dashboard**: Beautiful React dashboard for managing scans and reports
- **Real-time Analysis**: Fast, real-time accessibility analysis

## 📁 Project Structure

```
ai-accessibility-validator-and-auto-fixer/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main API endpoints
│   ├── services/           # AI and analysis services
│   └── requirements.txt    # Python dependencies
├── extension/              # Browser extension (Manifest v3)
│   ├── manifest.json
│   ├── popup.html/js/css
│   ├── content.js/css
│   └── background.js
├── app/                    # Next.js frontend
│   ├── components/         # React components
│   ├── scanner/           # Scanner page
│   ├── reports/           # Reports page
│   ├── compare/           # Compare page
│   ├── team/              # Team dashboard
│   └── settings/          # Settings page
└── README.md
```

## 🚀 Quick Start

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment (recommended):**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the backend server:**
   ```bash
   python main.py
   # Or use uvicorn directly:
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

   The dashboard will be available at `http://localhost:3000`

3. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

### Browser Extension Setup

1. **Open Chrome/Edge:**
   - Navigate to `chrome://extensions/` (Chrome) or `edge://extensions/` (Edge)

2. **Enable Developer Mode:**
   - Toggle "Developer mode" in the top right

3. **Load Extension:**
   - Click "Load unpacked"
   - Select the `extension` folder from this project

4. **Use Extension:**
   - Click the extension icon in your toolbar
   - Click "Scan This Page" to scan the current page
   - View issues in the sidebar

## 📚 API Endpoints

### Backend API (`http://localhost:8000`)

- `POST /scan-url` - Scan a website URL
  ```json
  {
    "url": "https://example.com"
  }
  ```

- `POST /scan-html` - Scan raw HTML/CSS/JS
  ```json
  {
    "html": "<html>...</html>",
    "css": "/* CSS */",
    "js": "// JavaScript"
  }
  ```

- `POST /upload-file` - Upload and scan HTML file

- `POST /auto-fix` - Generate fix for an issue
  ```json
  {
    "issue_id": "issue-123",
    "element_selector": "#my-button",
    "issue_type": "missing_alt_text",
    "original_code": "<img src='photo.jpg' />"
  }
  ```

- `GET /wcag-rules` - Get list of WCAG rules checked

- `GET /health` - Health check

## 🎨 Frontend Pages

- **Home** (`/`) - Dashboard overview and features
- **Scanner** (`/scanner`) - Scan URLs or upload HTML files
- **Reports** (`/reports`) - View and manage scan reports
- **Compare** (`/compare`) - Before/after code comparison
- **Team** (`/team`) - Team dashboard and collaboration
- **Settings** (`/settings`) - Application settings

## 🔍 Accessibility Checks

The system checks for:

1. **Missing Alt Text** - Images without alt attributes
2. **Color Contrast** - Text/background contrast ratios (WCAG AA/AAA)
3. **ARIA Issues** - Invalid or missing ARIA attributes
4. **Keyboard Navigation** - Focus indicators and keyboard accessibility
5. **Semantic HTML** - Proper use of semantic elements
6. **Form Labels** - Missing or improper form labels
7. **Heading Hierarchy** - Proper h1-h6 structure
8. **Text Readability** - Flesch Reading Ease scoring
9. **Focus Indicators** - Visible focus styles
10. **Language Attribute** - HTML lang attribute

## 🤖 AI Components

- **Image Captioning**: Generates alt text for images
- **Contrast Analysis**: Analyzes color contrast ratios
- **ARIA Validation**: Validates ARIA attribute usage
- **Readability Scoring**: NLP-based text analysis
- **Smart Fixes**: AI-generated code fixes with explanations

## 🛠️ Technologies

### Backend
- FastAPI - Modern Python web framework
- BeautifulSoup4 - HTML parsing
- OpenCV - Image processing
- Transformers - AI models (optional, can be integrated)
- Pillow - Image handling

### Frontend
- Next.js 14 - React framework
- TypeScript - Type safety
- Tailwind CSS - Utility-first CSS
- Axios - HTTP client
- Lucide React - Icons

### Extension
- Manifest v3 - Chrome extension format
- Vanilla JavaScript - No framework dependencies

## 📝 Configuration

### Backend

Update `backend/main.py` to configure:
- CORS origins (default: `*`)
- API port (default: 8000)
- Database connection (if using)

### Frontend

Update `.env.local` (create if needed):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Extension

Update `extension/popup.js` and `extension/content.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000'; // Your backend URL
```

## 🧪 Example Usage

### Scan a URL
```bash
curl -X POST http://localhost:8000/scan-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### Get Fix for Issue
```bash
curl -X POST http://localhost:8000/auto-fix \
  -H "Content-Type: application/json" \
  -d '{
    "issue_id": "issue-1",
    "element_selector": "img",
    "issue_type": "missing_alt_text",
    "original_code": "<img src=\"photo.jpg\" />"
  }'
```

## 📊 Sample Output

```json
{
  "success": true,
  "url": "https://example.com",
  "issues": [
    {
      "id": "alt-missing-0",
      "type": "missing_alt_text",
      "severity": "high",
      "wcag_level": "A",
      "wcag_rule": "1.1.1",
      "message": "Image missing alt attribute",
      "description": "Images must have an alt attribute...",
      "fix_suggestion": "Add alt attribute with descriptive text"
    }
  ],
  "total_issues": 12,
  "wcag_level": "AA",
  "score": 87.5
}
```

## 🚧 Future Enhancements

- [ ] Real ML models integration (BLIP, GPT-4 Vision)
- [ ] Database persistence (PostgreSQL/MongoDB)
- [ ] User authentication and teams
- [ ] Scheduled scans
- [ ] PDF report generation
- [ ] CI/CD integration
- [ ] Multi-language support

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on the repository.

---

**Built with ❤️ for web accessibility**

