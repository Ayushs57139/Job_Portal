#!/bin/bash

# Production startup script for JobWala Server
# This script ensures the server starts with proper production settings

set -e

echo "🚀 Starting JobWala Server in Production Mode"
echo "=============================================="

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found"
    echo "Please create .env file from env.example"
    exit 1
fi

# Check if NODE_ENV is set to production
if ! grep -q "NODE_ENV=production" .env; then
    echo "⚠️  Warning: NODE_ENV is not set to production in .env file"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if JWT_SECRET is set and not default
if grep -q "JWT_SECRET=your-super-secret-jwt-key-change-this-in-production" .env; then
    echo "❌ Error: JWT_SECRET is still set to default value"
    echo "Please change JWT_SECRET in .env file to a strong, random string"
    exit 1
fi

# Check if MongoDB URI is set
if ! grep -q "MONGODB_URI=" .env || grep -q "MONGODB_URI=$" .env; then
    echo "❌ Error: MONGODB_URI is not set in .env file"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ Environment file found"
echo "✅ Starting server..."
echo ""

# Start with PM2 if available, otherwise use node directly
if command -v pm2 &> /dev/null; then
    echo "Using PM2 to start server..."
    pm2 start ecosystem.config.js --env production
    echo ""
    echo "✅ Server started with PM2"
    echo "Use 'pm2 logs jobwala-server' to view logs"
    echo "Use 'pm2 status' to check server status"
else
    echo "PM2 not found. Starting with node directly..."
    echo "⚠️  For production, it's recommended to use PM2: npm install -g pm2"
    echo ""
    node index.js
fi

