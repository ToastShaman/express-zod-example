FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY tsconfig.json ./

# Build the TypeScript code
RUN npm run build

# Production stage
FROM node:22-alpine AS production

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /usr/src/app/build/ ./build/

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S api -u 1001

# Change ownership of the app directory
RUN chown -R api:nodejs /usr/src/app
USER api

# Expose port (adjust if your app uses a different port)
EXPOSE 3000

# Health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the server
CMD ["node", "build/index.js"]
