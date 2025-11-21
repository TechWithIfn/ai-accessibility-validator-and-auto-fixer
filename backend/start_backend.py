"""
Start Backend Server Script
Ensures dependencies are installed and starts the server
"""

import sys
import subprocess
import os
from pathlib import Path

def check_and_install_dependencies():
    """Check and install dependencies if needed"""
    requirements_file = Path(__file__).parent / "requirements.txt"
    
    if not requirements_file.exists():
        print("❌ requirements.txt not found!")
        return False
    
    print("📦 Checking dependencies...")
    try:
        import fastapi
        import uvicorn
        print("✅ Core dependencies found")
        return True
    except ImportError:
        print("⚠️  Installing dependencies...")
        try:
            subprocess.check_call([
                sys.executable, "-m", "pip", "install", "-r", str(requirements_file)
            ])
            print("✅ Dependencies installed successfully")
            return True
        except subprocess.CalledProcessError:
            print("❌ Failed to install dependencies")
            return False

def start_server():
    """Start the FastAPI server"""
    print("\n" + "="*50)
    print("🚀 Starting AI Accessibility Validator Backend")
    print("="*50)
    print(f"📍 Python: {sys.executable}")
    print(f"📍 Version: {sys.version}")
    print("="*50 + "\n")
    
    # Change to backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    # Check dependencies
    if not check_and_install_dependencies():
        print("\n❌ Failed to set up dependencies. Exiting...")
        sys.exit(1)
    
    print("\n" + "="*50)
    print("🌐 Server starting on http://localhost:8000")
    print("📚 API Docs: http://localhost:8000/docs")
    print("💚 Health: http://localhost:8000/health")
    print("="*50)
    print("Press Ctrl+C to stop the server\n")
    
    # Import and run the app
    try:
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
    except Exception as e:
        print(f"\n❌ Error starting server: {e}")
        print("\nTroubleshooting:")
        print("1. Make sure all dependencies are installed: pip install -r requirements.txt")
        print("2. Check if port 8000 is available")
        print("3. Verify Python version is 3.8+")
        sys.exit(1)

if __name__ == "__main__":
    start_server()

