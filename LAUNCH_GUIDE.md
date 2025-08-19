# InsightForge Launch Guide
## Streamlined Application Launch for Testing

**Date:** 2025-01-17  
**Purpose:** Resolve backend launch issues and provide consistent application startup

---

## 🚨 Critical Issues Identified

### 1. Backend Launch Problems
- **Multiple processes:** Multiple Python instances running simultaneously
- **Port conflicts:** Port 5001 frequently in use
- **Module import failures:** Competitive intelligence modules may not load
- **Database initialization:** SQLite databases may not initialize properly

### 2. Frontend-Backend Integration Issues
- **Hardcoded URLs:** Frontend uses hardcoded localhost:5001
- **Port mismatches:** Frontend on 8080, backend on 5001
- **CORS issues:** Cross-origin requests may fail
- **Error handling:** Poor fallback when backend unavailable

---

## 🚀 Streamlined Launch Process

### Step 1: Clean Environment
```bash
# Kill all existing processes
pkill -f "insightforge_app.py"
pkill -f "python.*insightforge_app.py"
pkill -f "node.*vite"

# Check what's using the ports
lsof -i :5001
lsof -i :8080
```

### Step 2: Launch Backend (Terminal 1)
```bash
cd server

# Use the streamlined launcher
python launch_backend.py

# OR manually (if launcher fails)
python insightforge_app.py
```

**Expected Output:**
```
🚀 InsightForge Backend Launcher
==================================================
🎯 INSIGHTFORGE BACKEND STATUS
==================================================
Backend Port 5001: ✅ Available
Frontend Port 8080: ✅ Available
Backend Processes: None running
==================================================
🔍 Checking dependencies...
✅ flask
✅ flask_cors
✅ requests
✅ beautifulsoup4
✅ pandas
✅ numpy
✅ All required modules available
🔍 Checking competitive intelligence modules...
✅ competitive_intelligence_api
✅ hybrid_competitive_scraper
✅ competitive_intelligence_db
✅ Competitive intelligence system available (3/3 modules)
🔍 Checking database files...
✅ scraped_data.db (9.0 MB)
✅ competitive_intelligence.db (0.0 MB)
==================================================
🔍 Checking for existing processes...
✅ No existing processes found
🚀 Launching InsightForge backend on port 5001...
✅ Backend process started (PID: 12345)
✅ Backend process is running
🔍 Testing backend health...
✅ Backend healthy: healthy
✅ Competitive intelligence system available

🎉 Backend launched successfully!
🌐 Backend URL: http://localhost:5001
🔗 Health Check: http://localhost:5001/health
📊 Status: http://localhost:5001/api/status
🏆 Competitive Intelligence: http://localhost:5001/api/competitive-intelligence/status

💻 Frontend should be running on: http://localhost:8080
📱 Press Ctrl+C to stop the backend
```

### Step 3: Launch Frontend (Terminal 2)
```bash
cd client

# Use the streamlined launcher
./launch_frontend.sh

# OR manually
npm run dev
```

**Expected Output:**
```
🚀 Launching InsightForge Frontend...
==========================================
✅ Starting frontend on http://localhost:8080
🌐 Backend should be running on http://localhost:5001
📱 Press Ctrl+C to stop the frontend
==========================================
> vite_react_shadcn_ts@0.0.0 dev
> vite

  VITE v5.4.19  ready in 301 ms
  ➜  Local:   http://localhost:8080/
  ➜  Network: http://10.10.8.117:8080/
```

### Step 4: Test Backend Health
```bash
# Test basic health
curl http://localhost:5001/health

# Test comprehensive status
curl http://localhost:5001/api/status

# Test competitive intelligence
curl http://localhost:5001/api/competitive-intelligence/status
```

---

## 🔧 Troubleshooting

### Backend Won't Start

#### Issue: Port 5001 in use
```bash
# Find what's using the port
lsof -i :5001

# Kill the process
kill -9 <PID>

# Or kill all Python processes
pkill -f python
```

#### Issue: Module import errors
```bash
# Check Python version
python --version

# Install missing dependencies
pip install -r requirements_competitive_intelligence.txt

# Check module availability
python -c "import competitive_intelligence_api; print('OK')"
```

#### Issue: Database errors
```bash
# Remove corrupted databases
rm -f server/*.db server/*.db-*

# Restart backend (will recreate databases)
python launch_backend.py
```

### Frontend Won't Connect

#### Issue: CORS errors
- Ensure backend has CORS enabled
- Check browser console for CORS errors
- Verify backend is running on port 5001

#### Issue: API calls failing
```bash
# Test API endpoints directly
curl http://localhost:5001/api/scraped-items
curl http://localhost:5001/api/competitive-intelligence/companies
```

#### Issue: Port 8080 in use
```bash
# Find what's using the port
lsof -i :8080

# Kill the process
kill -9 <PID>
```

---

## 📊 Testing Checklist

### Backend Health
- [ ] `/health` endpoint responds with 200
- [ ] `/api/status` shows all systems healthy
- [ ] Competitive intelligence modules loaded
- [ ] Database files accessible
- [ ] CORS headers present

### Frontend Functionality
- [ ] Dashboard loads without errors
- [ ] Backend status indicator shows "Connected"
- [ ] Sigma data loads (preset or scraped)
- [ ] Competitor selection dropdown populated
- [ ] Scrape button functional
- [ ] Comparison data displays properly

### Competitive Intelligence
- [ ] All 10 strategic dimensions accessible
- [ ] Competitor data can be scraped
- [ ] Side-by-side comparisons work
- [ ] Data persists between sessions
- [ ] Export functionality works

---

## 🎯 Success Indicators

### Backend Success
- ✅ Single process running on port 5001
- ✅ Health check responds within 2 seconds
- ✅ All API endpoints accessible
- ✅ Competitive intelligence system available
- ✅ No error messages in console

### Frontend Success
- ✅ Dashboard loads completely
- ✅ No "Backend Unavailable" warnings
- ✅ Sigma data displays properly
- ✅ Competitor selection works
- ✅ Scraping functionality operational

### Integration Success
- ✅ Frontend can communicate with backend
- ✅ Data flows between systems
- ✅ Real-time updates work
- ✅ Error handling graceful
- ✅ User experience smooth

---

## 🚨 Emergency Procedures

### Complete Reset
```bash
# Kill all processes
pkill -f "insightforge_app.py"
pkill -f "python.*insightforge_app.py"
pkill -f "node.*vite"

# Clear ports
lsof -ti:5001 | xargs kill -9
lsof -ti:8080 | xargs kill -9

# Restart from scratch
cd server && python launch_backend.py
# In new terminal:
cd client && ./launch_frontend.sh
```

### Fallback Mode
If competitive intelligence system fails:
- Backend will run in legacy mode
- Basic scraping functionality available
- Frontend will show appropriate warnings
- Core functionality preserved

---

## 📝 Launch Commands Summary

### Quick Start (Recommended)
```bash
# Terminal 1: Backend
cd server && python launch_backend.py

# Terminal 2: Frontend  
cd client && ./launch_frontend.sh
```

### Manual Start
```bash
# Terminal 1: Backend
cd server && python insightforge_app.py

# Terminal 2: Frontend
cd client && npm run dev
```

### Health Check
```bash
curl http://localhost:5001/health
curl http://localhost:5001/api/status
```

---

## 🔍 Monitoring

### Backend Monitoring
- Watch console for error messages
- Monitor process status with `ps aux | grep insightforge`
- Check port usage with `lsof -i :5001`
- Verify database file sizes

### Frontend Monitoring
- Watch browser console for errors
- Monitor network requests in DevTools
- Check for CORS or connection errors
- Verify data loading states

---

**Status:** Ready for implementation  
**Priority:** Critical - Required for MVP testing  
**Next Steps:** Execute launch process and validate functionality
