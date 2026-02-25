# Chat Support Quick Fix Script (PowerShell)
# This script helps diagnose and fix common chat support issues

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🔧 Chat Support System - Quick Fix" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend is running
Write-Host "1️⃣  Checking backend server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Backend server is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend server is NOT running" -ForegroundColor Red
    Write-Host "   Fix: cd backend; npm start" -ForegroundColor Yellow
}

Write-Host ""

# Check if frontend is running
Write-Host "2️⃣  Checking frontend server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Frontend server is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend server is NOT running" -ForegroundColor Red
    Write-Host "   Fix: cd frontend; npm run dev" -ForegroundColor Yellow
}

Write-Host ""

# Check Node.js test script
Write-Host "3️⃣  Running comprehensive tests..." -ForegroundColor Yellow
if (Test-Path "test-chat-system.js") {
    Write-Host "   Running test script..." -ForegroundColor Cyan
    node test-chat-system.js
} else {
    Write-Host "   Test script not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "📋 Next Steps" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Make sure both servers are running" -ForegroundColor White
Write-Host "2. Ensure admin user exists in database" -ForegroundColor White
Write-Host "3. Check browser console for errors" -ForegroundColor White
Write-Host "4. Test sending messages between users" -ForegroundColor White
Write-Host ""
