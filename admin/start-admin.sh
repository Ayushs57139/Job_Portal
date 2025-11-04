#!/bin/bash
# Admin Panel Startup Script for Linux/Mac

echo "Starting Free Job Wala Admin Panel..."
echo "Admin panel will run on: http://localhost:8081"
echo "Backend API: http://localhost:5000/api"
echo ""
echo "Installing dependencies..."
npm install

echo ""
echo "Starting admin panel..."
npm start

