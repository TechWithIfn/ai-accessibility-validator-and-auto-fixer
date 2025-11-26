# CORS Configuration for Production

## Current Configuration

The backend currently allows all origins (`allow_origins=["*"]`), which is fine for development but should be restricted in production.

## Update for Production

In `backend/main.py`, update the CORS configuration:

```python
import os

# Get frontend URL from environment variable or use default
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://your-frontend.vercel.app")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:3000",  # For local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Environment Variable

Set `FRONTEND_URL` in your deployment platform (Railway/Render):
```
FRONTEND_URL=https://your-frontend.vercel.app
```

This ensures only your frontend can access the backend API.

