#!/usr/bin/env python3
"""
Streamlined Backend Launch Script for InsightForge
Addresses multiple process issues, port conflicts, and module initialization problems
"""

import os
import sys
import time
import signal
import subprocess
import psutil
import socket
from pathlib import Path

# Configuration
BACKEND_PORT = 5001
FRONTEND_PORT = 8080
APP_NAME = "insightforge_app.py"
SCRIPT_DIR = Path(__file__).parent

def check_port_available(port):
    """Check if a port is available"""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(('localhost', port))
            return True
    except OSError:
        return False

def kill_existing_processes():
    """Kill all existing InsightForge processes"""
    print("🔍 Checking for existing processes...")
    
    killed_count = 0
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            cmdline = ' '.join(proc.info['cmdline']) if proc.info['cmdline'] else ''
            if APP_NAME in cmdline or 'insightforge_app' in cmdline:
                print(f"🔄 Terminating process {proc.info['pid']}: {proc.info['name']}")
                proc.terminate()
                proc.wait(timeout=5)
                killed_count += 1
        except (psutil.NoSuchProcess, psutil.TimeoutExpired):
            pass
    
    if killed_count > 0:
        print(f"✅ Terminated {killed_count} existing processes")
        time.sleep(2)  # Wait for cleanup
    else:
        print("✅ No existing processes found")

def check_dependencies():
    """Check if required Python modules are available"""
    print("🔍 Checking dependencies...")
    
    required_modules = [
        'flask',
        'flask_cors',
        'requests',
        'bs4',
        'pandas',
        'numpy'
    ]
    
    missing_modules = []
    for module in required_modules:
        try:
            __import__(module)
            print(f"✅ {module}")
        except ImportError:
            missing_modules.append(module)
            print(f"❌ {module}")
    
    if missing_modules:
        print(f"\n⚠️  Missing modules: {', '.join(missing_modules)}")
        print("Install with: pip install -r requirements_competitive_intelligence.txt")
        return False
    
    print("✅ All required modules available")
    return True

def check_competitive_intelligence_modules():
    """Check if competitive intelligence modules are available"""
    print("🔍 Checking competitive intelligence modules...")
    
    ci_modules = [
        'competitive_intelligence_api',
        'hybrid_competitive_scraper', 
        'competitive_intelligence_db'
    ]
    
    available_modules = []
    for module in ci_modules:
        try:
            __import__(module)
            available_modules.append(module)
            print(f"✅ {module}")
        except ImportError as e:
            print(f"❌ {module}: {e}")
    
    if available_modules:
        print(f"✅ Competitive intelligence system available ({len(available_modules)}/3 modules)")
        return True
    else:
        print("⚠️  Competitive intelligence system not available - will run in legacy mode")
        return False

def check_database_files():
    """Check database file status"""
    print("🔍 Checking database files...")
    
    db_files = [
        'scraped_data.db',
        'competitive_intelligence.db'
    ]
    
    for db_file in db_files:
        db_path = SCRIPT_DIR / db_file
        if db_path.exists():
            size_mb = db_path.stat().st_size / (1024 * 1024)
            print(f"✅ {db_file} ({size_mb:.1f} MB)")
        else:
            print(f"⚠️  {db_file} not found - will be created on first run")
    
    return True

def launch_backend():
    """Launch the backend server"""
    print(f"🚀 Launching InsightForge backend on port {BACKEND_PORT}...")
    
    # Change to script directory
    os.chdir(SCRIPT_DIR)
    
    # Launch the app
    try:
        process = subprocess.Popen([
            sys.executable, APP_NAME
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        print(f"✅ Backend process started (PID: {process.pid})")
        
        # Wait a moment for startup
        time.sleep(3)
        
        # Check if process is still running
        if process.poll() is None:
            print("✅ Backend process is running")
            return process
        else:
            stdout, stderr = process.communicate()
            print("❌ Backend failed to start")
            print(f"STDOUT: {stdout}")
            print(f"STDERR: {stderr}")
            return None
            
    except Exception as e:
        print(f"❌ Failed to launch backend: {e}")
        return None

def test_backend_health():
    """Test if backend is responding"""
    print("🔍 Testing backend health...")
    
    try:
        import requests
        response = requests.get(f"http://localhost:{BACKEND_PORT}/health", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend healthy: {data.get('status', 'unknown')}")
            
            # Check competitive intelligence availability
            if data.get('competitive_intelligence_available'):
                print("✅ Competitive intelligence system available")
            else:
                print("⚠️  Competitive intelligence system not available")
            
            return True
        else:
            print(f"❌ Backend unhealthy: HTTP {response.status_code}")
            return False
            
    except ImportError:
        print("⚠️  requests module not available - skipping health check")
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def show_status():
    """Show current system status"""
    print("\n" + "="*60)
    print("🎯 INSIGHTFORGE BACKEND STATUS")
    print("="*60)
    
    # Port status
    backend_port_status = "✅ Available" if check_port_available(BACKEND_PORT) else "❌ In Use"
    frontend_port_status = "✅ Available" if check_port_available(FRONTEND_PORT) else "❌ In Use"
    
    print(f"Backend Port {BACKEND_PORT}: {backend_port_status}")
    print(f"Frontend Port {FRONTEND_PORT}: {frontend_port_status}")
    
    # Process status
    insightforge_processes = []
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            cmdline = ' '.join(proc.info['cmdline']) if proc.info['cmdline'] else ''
            if APP_NAME in cmdline or 'insightforge_app' in cmdline:
                insightforge_processes.append(proc.info)
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    
    if insightforge_processes:
        print(f"Backend Processes: {len(insightforge_processes)} running")
        for proc in insightforge_processes:
            print(f"  - PID {proc['pid']}: {proc['name']}")
    else:
        print("Backend Processes: None running")
    
    print("="*60)

def main():
    """Main launch function"""
    print("🚀 InsightForge Backend Launcher")
    print("="*50)
    
    # Show initial status
    show_status()
    
    # Check dependencies
    if not check_dependencies():
        print("\n❌ Cannot proceed without required dependencies")
        sys.exit(1)
    
    # Check competitive intelligence modules
    ci_available = check_competitive_intelligence_modules()
    
    # Check database files
    check_database_files()
    
    print("\n" + "="*50)
    
    # Kill existing processes
    kill_existing_processes()
    
    # Wait for port to be available
    if not check_port_available(BACKEND_PORT):
        print(f"⚠️  Port {BACKEND_PORT} still not available after cleanup")
        print("Please check what's using the port and try again")
        sys.exit(1)
    
    # Launch backend
    process = launch_backend()
    if not process:
        print("\n❌ Failed to launch backend")
        sys.exit(1)
    
    # Test health
    if test_backend_health():
        print("\n🎉 Backend launched successfully!")
        print(f"🌐 Backend URL: http://localhost:{BACKEND_PORT}")
        print(f"🔗 Health Check: http://localhost:{BACKEND_PORT}/health")
        print(f"📊 Status: http://localhost:{BACKEND_PORT}/api/status")
        
        if ci_available:
            print(f"🏆 Competitive Intelligence: http://localhost:{BACKEND_PORT}/api/competitive-intelligence/status")
        
        print(f"\n💻 Frontend should be running on: http://localhost:{FRONTEND_PORT}")
        print("📱 Press Ctrl+C to stop the backend")
        
        try:
            # Keep the process running
            process.wait()
        except KeyboardInterrupt:
            print("\n\n🛑 Stopping backend...")
            process.terminate()
            process.wait()
            print("✅ Backend stopped")
    else:
        print("\n❌ Backend health check failed")
        process.terminate()
        sys.exit(1)

if __name__ == "__main__":
    main()
