# Multi-stage build for Node.js server
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY server/package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files and installed dependencies from builder
COPY --from=builder /app/node_modules ./node_modules
COPY server/package*.json ./

# Copy application files
COPY server/ ./

# Create necessary directories
RUN mkdir -p uploads/logos uploads/profile-pictures uploads/resumes uploads/themes uploads/icons logs && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "index.js"]

