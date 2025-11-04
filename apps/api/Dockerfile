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

# Copy only what we need for the API
COPY apps/api ./apps/api

# Install dependencies - monorepo workspaces will be resolved automatically
RUN npm ci --prefer-offline --no-audit 2>&1

# Set environment for production
ENV NODE_ENV=production
EXPOSE 3001

# Start the API server - removed --unhandled-rejections=strict to see actual errors
CMD ["node", "apps/api/src/index.js"]