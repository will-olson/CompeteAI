# Launch and Testing Instructions for InsightForge Backend

## 🚀 **Quick Start Commands**

### **1. Kill Existing Processes**
```bash
# Kill any existing Python processes using port 5001
pkill -f "python.*insightforge_app.py"
pkill -f "python.*insightforge"

# Verify port is free
lsof -i :5001 || echo "Port 5001 is free"
```

### **2. Launch Backend Server**
```bash
cd /Users/willolson/Development/StockMarketAI/server
python3 insightforge_app.py > server.log 2>&1 &
```

### **3. Verify Backend is Running**
```bash
# Check server log
tail -10 server.log

# Verify Flask is running (should show "Running on http://127.0.0.1:5001")
grep "Running on" server.log
```

### **4. Launch Frontend**
```bash
cd /Users/willolson/Development/StockMarketAI/client
npm run dev
```

## 🔧 **Current Configuration**

- **Backend Port**: 5001 (FIXED - DO NOT CHANGE)
- **Frontend Port**: 8080 (Vite default)
- **API Base URL**: `http://localhost:5001` (configured in `client/src/utils/APIService.ts`)

## 📋 **Available API Endpoints (Server Side)**

### **Core Endpoints (Working)**
- **Health**: `GET /health` ✅
- **Scraped Items**: `GET /api/scraped-items` ✅
- **Company Data**: `GET /api/company-data` ✅
- **Competitive Intelligence**: `GET /api/competitive-intelligence` ✅
- **Preset Groups**: `GET /api/preset-groups` ✅

### **Scraping Endpoints (Working)**
- **Scrape Company**: `POST /api/scrape/company` ✅
- **Scrape Group**: `POST /api/scrape/group` ✅
- **Technical Scraping**: `POST /api/scrape/technical` ✅

### **AI Analysis Endpoints (Working)**
- **Technical Analysis**: `POST /api/ai/analyze-technical` ✅
- **Content Analysis**: `POST /api/ai/analyze` ✅
- **Battlecard Generation**: `POST /api/ai/battlecard` ✅

## ⚠️ **API Mismatches (Client vs Server)**

### **Client Expects (Missing from Server)**
- `POST /api/start-scraping` ❌
- `GET /api/scraping-status/{jobId}` ❌

### **Server Has (Client Not Using)**
- `POST /api/scrape/company` ✅
- `POST /api/scrape/group` ✅
- `POST /api/ai/analyze-technical` ✅

## 🐛 **Current Issues Identified**

1. **API Endpoint Mismatch**: Client trying to call non-existent endpoints
2. **Frontend Components**: Tech Intelligence page and ScrapeDashboard tabs not working
3. **Data Flow**: Disconnect between client expectations and server capabilities

## 🧪 **Testing Checklist**

### **Backend Health**
- [ ] Server starts without errors
- [ ] Port 5001 is accessible
- [ ] Health endpoint responds
- [ ] Database connections working

### **Frontend Integration**
- [ ] Frontend builds successfully
- [ ] Frontend connects to backend on port 5001
- [ ] No console errors in browser
- [ ] BackendStatus shows correct connection

### **Component Functionality**
- [ ] ScrapeDashboard loads without crashes
- [ ] Targets tab works properly
- [ ] Data View tab displays content
- [ ] Tech Intelligence page loads
- [ ] Data Visualization shows real data

## 📁 **File Locations**

- **Backend App**: `server/insightforge_app.py`
- **Frontend API Config**: `client/src/utils/APIService.ts`
- **Server Log**: `server/server.log`
- **Database**: `server/scraped_data.db`
- **Competitive Intelligence**: `server/competitive_intelligence_output/`

## 🔄 **Restart Sequence**

1. **Kill Backend**: `pkill -f "python.*insightforge"`
2. **Wait**: `sleep 2`
3. **Verify Port Free**: `lsof -i :5001 || echo "Port free"`
4. **Launch Backend**: `python3 insightforge_app.py > server.log 2>&1 &`
5. **Wait**: `sleep 3`
6. **Check Log**: `tail -5 server.log`
7. **Verify Running**: `grep "Running on" server.log`

## �� **Expected Data**

### **Database Content**
- **Companies**: 30+ (Snowflake, Databricks, PowerBI, Tableau, Oracle, etc.)
- **Categories**: api_docs, docs, features, pricing, integrations, RSS
- **Total Items**: 1000+ scraped items

### **Markdown Files**
- **Location**: `competitive_intelligence_output/scraped_markdown/`
- **Content**: AI summaries, insights, technical analysis
- **Format**: Company_Category_Date.md

## 🎯 **Immediate Action Items**

1. **Fix API Endpoint Mismatches**: Update client to use correct server endpoints
2. **Resolve Frontend Component Issues**: Fix Tech Intelligence and ScrapeDashboard tabs
3. **Ensure Data Flow**: Connect client components to working server endpoints
4. **Test End-to-End**: Verify complete user experience in browser

## 🚨 **Debugging Commands**

```bash
# Monitor server log in real-time
tail -f server.log

# Check Python processes
ps aux | grep python

# Check database content
sqlite3 scraped_data.db ".tables"
sqlite3 scraped_data.db "SELECT COUNT(*) FROM scraped_items;"

# Check frontend build
cd /Users/willolson/Development/StockMarketAI/client
npm run build
```

## ✅ **Success Criteria**

- Backend runs on port 5001 without errors
- Frontend builds and connects successfully to backend
- All dashboard tabs load without crashes
- Real scraped data displays in Data View and Tech Intelligence
- No console errors in browser
- Consistent backend connection status
- API endpoints match between client and server
