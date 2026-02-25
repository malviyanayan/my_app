# WebSocket Verification Script (PowerShell)

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "🔍 WebSocket Live Chat - Verification" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

$allGood = $true

# Check 1: Backend Server
Write-Host "1️⃣  Checking Backend Server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "   ✅ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend is NOT running" -ForegroundColor Red
    Write-Host "   Fix: cd backend; npm start" -ForegroundColor Yellow
    $allGood = $false
}

# Check 2: Socket.IO Endpoint
Write-Host "`n2️⃣  Checking Socket.IO Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/socket.io/" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "   ✅ Socket.IO is accessible" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Host "   ✅ Socket.IO is accessible (expected 400)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Socket.IO endpoint error" -ForegroundColor Red
        $allGood = $false
    }
}

# Check 3: Frontend Server
Write-Host "`n3️⃣  Checking Frontend Server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "   ✅ Frontend is running" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Frontend is NOT running" -ForegroundColor Red
    Write-Host "   Fix: cd frontend; npm run dev" -ForegroundColor Yellow
    $allGood = $false
}

# Check 4: WebSocket Configuration Files
Write-Host "`n4️⃣  Checking WebSocket Configuration..." -ForegroundColor Yellow

if (Test-Path "backend/server.js") {
    $serverContent = Get-Content "backend/server.js" -Raw
    if ($serverContent -match "socket\.io") {
        Write-Host "   ✅ Backend has Socket.IO configured" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Socket.IO not found in backend" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "   ❌ backend/server.js not found" -ForegroundColor Red
    $allGood = $false
}

if (Test-Path "frontend/src/services/socket.js") {
    $socketContent = Get-Content "frontend/src/services/socket.js" -Raw
    if ($socketContent -match "socket\.io-client") {
        Write-Host "   ✅ Frontend has Socket.IO client configured" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Socket.IO client not found in frontend" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "   ❌ frontend/src/services/socket.js not found" -ForegroundColor Red
    $allGood = $false
}

# Summary
Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "📋 Summary" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "✅ All checks passed!" -ForegroundColor Green
    Write-Host "`nWebSocket is configured correctly.`n" -ForegroundColor Green
    
    Write-Host "📝 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Open TWO browser windows" -ForegroundColor White
    Write-Host "2. Window 1: Login as ADMIN" -ForegroundColor White
    Write-Host "3. Window 2: Login as USER" -ForegroundColor White
    Write-Host "4. Both go to Dashboard → Chat Support" -ForegroundColor White
    Write-Host "5. Open Browser Console (F12) in both" -ForegroundColor White
    Write-Host "6. Send messages and watch console logs`n" -ForegroundColor White
    
    Write-Host "🔍 What to look for:" -ForegroundColor Yellow
    Write-Host "User Console:" -ForegroundColor Cyan
    Write-Host "  ✅ Socket connected successfully" -ForegroundColor Green
    Write-Host "  ✅ Socket authenticated successfully" -ForegroundColor Green
    Write-Host "`nAdmin Console:" -ForegroundColor Cyan
    Write-Host "  ✅ Socket connected successfully" -ForegroundColor Green
    Write-Host "  ✅ Socket authenticated successfully" -ForegroundColor Green
    Write-Host "  ✅ Loaded X conversations`n" -ForegroundColor Green
    
    Write-Host "Backend Console:" -ForegroundColor Cyan
    Write-Host "  ✅ User <id> authenticated" -ForegroundColor Green
    Write-Host "  ✅ Total connected users: 2" -ForegroundColor Green
    Write-Host "  📤 Send message event received" -ForegroundColor Green
    Write-Host "  ✅ Message saved to database" -ForegroundColor Green
    Write-Host "  📨 Sending to receiver" -ForegroundColor Green
    Write-Host "  ✅ Message delivered to receiver`n" -ForegroundColor Green
    
} else {
    Write-Host "❌ Some checks failed!" -ForegroundColor Red
    Write-Host "`nPlease fix the issues above and try again.`n" -ForegroundColor Yellow
}

Write-Host "================================================`n" -ForegroundColor Cyan

Write-Host "📚 For detailed debugging:" -ForegroundColor Yellow
Write-Host "   See: WEBSOCKET_DEBUG_GUIDE.md`n" -ForegroundColor White

Write-Host "🧪 For comprehensive testing:" -ForegroundColor Yellow
Write-Host "   Run: node test-live-chat.js`n" -ForegroundColor White
