# syntax = docker/dockerfile:1

ARG NODE_VERSION=20.18.0
FROM node:${NODE_VERSION}-slim

LABEL fly_launch_runtime="Node.js"

WORKDIR /app

# Install essential build dependencies
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential python3 && \
    rm -rf /var/lib/apt/lists/*

# Copy package files from monorepo root
COPY package*.json ./

# Copy workspace package files - needed for npm ci to resolve dependencies
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/

# Copy actual source code
COPY apps/api ./apps/api

# Install dependencies for all workspaces (will be symlinked)
RUN echo "🔧 Installing dependencies..." && \
    npm ci --prefer-offline --no-audit 2>&1 && \
    echo "✅ Dependencies installed successfully"

# Set environment for production
ENV NODE_ENV=production
EXPOSE 3001

# Start the API server - removed --unhandled-rejections=strict to see actual errors
CMD ["node", "apps/api/src/index.js"]