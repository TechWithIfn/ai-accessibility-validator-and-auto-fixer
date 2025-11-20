# Backend API - AI Accessibility Validator

FastAPI backend for scanning websites and generating accessibility fixes.

## Setup

1. **Install Python 3.8+**

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run server:**
   ```bash
   python main.py
   # Or:
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## API Documentation

Once running, visit:
- API Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Environment Variables

Create `.env` file (optional):
```env
API_PORT=8000
CORS_ORIGINS=http://localhost:3000
DATABASE_URL=sqlite:///./accessibility.db
```

## Services

- `scanner.py` - Main scanning logic
- `contrast_analyzer.py` - Color contrast analysis
- `aria_checker.py` - ARIA attribute validation
- `keyboard_nav.py` - Keyboard navigation checks
- `readability_scorer.py` - Text readability scoring
- `ai_engine.py` - AI-powered features (alt text, fixes)
- `auto_fixer.py` - Automatic code fix generation

## Testing

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test scan
curl -X POST http://localhost:8000/scan-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

