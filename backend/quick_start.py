"""
Quick Start Script for Backend
Starts the FastAPI server with minimal dependencies check
"""

import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    print("=" * 60)
    print("🚀 AI Accessibility Validator - Backend Server")
    print("=" * 60)
    print(f"Python: {sys.executable}")
    print(f"Version: {sys.version.split()[0]}")
    print("=" * 60)
    print("\n⏳ Starting server on http://localhost:8000...")
    print("📚 API Docs: http://localhost:8000/docs")
    print("💚 Health: http://localhost:8000/health")
    print("\n" + "=" * 60)
    print("Press Ctrl+C to stop\n")
    
    import uvicorn
    from main import app
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
except KeyboardInterrupt:
    print("\n\n👋 Server stopped by user")
except ImportError as e:
    print(f"\n❌ Missing dependency: {e}")
    print("\n📦 Installing dependencies...")
    import subprocess
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed! Please run again.")
    except:
        print("❌ Failed to install. Please run manually:")
        print("   pip install -r requirements.txt")
    sys.exit(1)
except Exception as e:
    print(f"\n❌ Error starting server: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

