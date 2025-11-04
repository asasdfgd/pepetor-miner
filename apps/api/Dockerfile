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

# Copy API-specific files
COPY apps/api ./apps/api

# Install all dependencies
RUN npm ci --prefer-offline --no-audit

# Set environment for production
ENV NODE_ENV=production
EXPOSE 3001

# Start the API server with error handling
CMD ["node", "--unhandled-rejections=strict", "apps/api/src/index.js"]