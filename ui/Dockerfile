# Multi-stage build for Next.js frontend
FROM node:18-alpine AS deps

WORKDIR /app

ARG NEXT_PUBLIC_BACKEND_URL
ARG NODE_ENV

# Create .env.deps file with build-time environment variables
RUN touch /app/.env.deps && \
    for var in NEXT_PUBLIC_BACKEND_URL NODE_ENV; do \
      value=$(printenv $var); \
      echo "$var=$value" >> /app/.env.deps; \
    done

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package.json ./

# Install dependencies (including dev dependencies for build)
RUN npm install

# Builder stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

COPY --from=deps /app/.env.deps ./.env

# Copy package.json and tsconfig.json first
COPY package.json tsconfig.json next.config.mjs ./

# Copy source code
COPY . .

# Clean any existing build artifacts
RUN rm -rf .next

# Set build-time environment variables directly
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copy built Next.js application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variable for port
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=120s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]
