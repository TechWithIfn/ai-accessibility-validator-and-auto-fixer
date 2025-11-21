"""
Test server startup
"""

import sys
import os

print("Testing backend startup...")
print(f"Python: {sys.executable}")
print(f"Python version: {sys.version}")

try:
    print("\n1. Testing FastAPI import...")
    import fastapi
    print("   ✅ FastAPI imported")
except ImportError as e:
    print(f"   ❌ FastAPI import failed: {e}")
    print("   Run: pip install fastapi")
    sys.exit(1)

try:
    print("\n2. Testing uvicorn import...")
    import uvicorn
    print("   ✅ uvicorn imported")
except ImportError as e:
    print(f"   ❌ uvicorn import failed: {e}")
    print("   Run: pip install uvicorn")
    sys.exit(1)

try:
    print("\n3. Testing main.py import...")
    from main import app
    print("   ✅ main.py imported successfully")
except Exception as e:
    print(f"   ❌ main.py import failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n✅ All tests passed! Server should start successfully.")
print("\nTo start the server, run:")
print("  python main.py")
print("  or")
print("  uvicorn main:app --reload --host 0.0.0.0 --port 8000")

