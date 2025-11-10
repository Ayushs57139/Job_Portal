#!/bin/bash

# JobWala Deployment Script
# This script helps deploy the JobWala server to production

set -e

echo "🚀 JobWala Deployment Script"
echo "============================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f "server/.env" ]; then
    echo -e "${YELLOW}⚠️  Warning: server/.env file not found${NC}"
    echo "Creating from env.example..."
    if [ -f "server/env.example" ]; then
        cp server/env.example server/.env
        echo -e "${GREEN}✅ Created server/.env from env.example${NC}"
        echo -e "${YELLOW}⚠️  Please edit server/.env with your production values before continuing${NC}"
        exit 1
    else
        echo -e "${RED}❌ Error: server/env.example not found${NC}"
        exit 1
    fi
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Error: Node.js 18+ required. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
cd server
npm ci --only=production
cd ..

# Check if PM2 is installed
if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}✅ PM2 is installed${NC}"
    
    # Stop existing PM2 process if running
    if pm2 list | grep -q "jobwala-server"; then
        echo "🛑 Stopping existing PM2 process..."
        pm2 stop jobwala-server || true
        pm2 delete jobwala-server || true
    fi
    
    # Start with PM2
    echo "🚀 Starting server with PM2..."
    cd server
    npm run prod
    cd ..
    
    echo ""
    echo -e "${GREEN}✅ Deployment complete!${NC}"
    echo ""
    echo "Useful commands:"
    echo "  pm2 status              - Check server status"
    echo "  pm2 logs jobwala-server - View logs"
    echo "  pm2 restart jobwala-server - Restart server"
    echo "  pm2 stop jobwala-server - Stop server"
else
    echo -e "${YELLOW}⚠️  PM2 not installed. Installing...${NC}"
    npm install -g pm2
    
    echo "🚀 Starting server with PM2..."
    cd server
    npm run prod
    cd ..
    
    echo ""
    echo -e "${GREEN}✅ Deployment complete!${NC}"
fi

# Health check
echo ""
echo "🏥 Performing health check..."
sleep 5

if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is healthy!${NC}"
else
    echo -e "${YELLOW}⚠️  Health check failed. Server may still be starting...${NC}"
    echo "Check logs with: pm2 logs jobwala-server"
fi

echo ""
echo "📝 Next steps:"
echo "  1. Configure reverse proxy (Nginx/Apache)"
echo "  2. Set up SSL certificates"
echo "  3. Configure domain DNS"
echo "  4. Set up monitoring"
echo ""
echo "For more information, see DEPLOYMENT.md"

