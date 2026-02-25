#!/bin/bash

# Chat Support Quick Fix Script
# This script helps diagnose and fix common chat support issues

echo "================================================"
echo "🔧 Chat Support System - Quick Fix"
echo "================================================"
echo ""

# Check if backend is running
echo "1️⃣  Checking backend server..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Backend server is running"
else
    echo "❌ Backend server is NOT running"
    echo "   Fix: cd backend && npm start"
    echo ""
fi

# Check if frontend is running
echo ""
echo "2️⃣  Checking frontend server..."
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ Frontend server is running"
else
    echo "❌ Frontend server is NOT running"
    echo "   Fix: cd frontend && npm run dev"
    echo ""
fi

# Check MongoDB
echo ""
echo "3️⃣  Checking MongoDB connection..."
if mongosh --eval "db.adminCommand('ping')" adrsmyapp > /dev/null 2>&1; then
    echo "✅ MongoDB is running"
    
    # Check for admin user
    echo ""
    echo "4️⃣  Checking for admin user..."
    ADMIN_COUNT=$(mongosh adrsmyapp --quiet --eval "db.users.countDocuments({role: 'admin'})")
    
    if [ "$ADMIN_COUNT" -gt 0 ]; then
        echo "✅ Admin user exists"
        mongosh adrsmyapp --quiet --eval "db.users.findOne({role: 'admin'}, {name: 1, email: 1, _id: 1})"
    else
        echo "❌ No admin user found"
        echo "   Fix: Create an admin user first"
        echo "   See: CREATE_ADMIN_USER.md"
    fi
    
    # Check messages
    echo ""
    echo "5️⃣  Checking messages..."
    MSG_COUNT=$(mongosh adrsmyapp --quiet --eval "db.messages.countDocuments()")
    echo "   Total messages: $MSG_COUNT"
    
else
    echo "❌ MongoDB is NOT running or not accessible"
    echo "   Fix: Start MongoDB service"
    echo ""
fi

echo ""
echo "================================================"
echo "📋 Summary"
echo "================================================"
echo ""
echo "If all checks pass, chat should work."
echo "If any check fails, follow the fix instructions above."
echo ""
echo "For detailed testing, run:"
echo "  node test-chat-system.js"
echo ""
