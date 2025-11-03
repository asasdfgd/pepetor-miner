# syntax = docker/dockerfile:1

ARG NODE_VERSION=20.18.0
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node.js"

WORKDIR /app

# Build stage
FROM base AS build

# Install build dependencies
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Copy package files
COPY package-lock.json package.json ./

# Install all dependencies (including devDependencies for build tools)
RUN npm ci

# Copy source code
COPY . .

# Only build the backend API workspace, skip frontend
RUN npm run build --workspace=apps/api --if-present || true

# Final stage
FROM base

ENV NODE_ENV="production"

# Copy built application
COPY --from=build /app /app

EXPOSE 3001

# Start the backend API
CMD ["node", "apps/api/src/index.js"]
