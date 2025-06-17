# Stage 1: Base image
FROM node:18.18.0-alpine3.18 AS base

# Install dependencies required for building native modules
RUN apk add --no-cache libc6-compat python3 make g++

# Stage 2: Install dependencies
FROM base AS deps
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --frozen-lockfile

# Stage 3: Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the Next.js app
RUN npm run build

# Debug: Check the contents of .next after build
RUN echo "Contents of /app/.next:" && ls -la /app/.next || echo "Directory .next not found"

# Stage 4: Development image (for local dev with docker-compose)
FROM base AS dev
WORKDIR /app

# Copy dependencies and source code
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Expose the port
EXPOSE 3000

# Start the app in development mode (command set in docker-compose.yaml)
CMD ["npm", "run", "dev"]

# Stage 5: Runner for production
FROM base AS runner
WORKDIR /app

# Create a non-root user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from the builder stage
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Set up .next/cache/images directory with correct permissions
RUN mkdir -p .next/cache/images
RUN chown -R nextjs:nodejs .next

# Debug: Verify the directory structure in the runner stage
RUN echo "Contents of /app:" && ls -la /app && \
    echo "Contents of /app/.next:" && ls -la /app/.next && \
    echo "Contents of /app/.next/cache:" && ls -la /app/.next/cache && \
    echo "Contents of /app/.next/cache/images:" && ls -la /app/.next/cache/images || echo "Directory .next/cache/images not found" && \
    echo "Contents of /app/public:" && ls -la /app/public || echo "Directory public not found"

# Set environment variables (can be overridden by .env or docker-compose)
ENV PORT=3000
ENV NODE_ENV=production
ENV APP_NAME=secretecho-frontend
ENV V1_API_ENDPOINT=http://localhost:3001/api/v1
ENV NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
ENV SESSION_COOKIE_NAME=secretecho_user_session
ENV SESSION_COOKIE_PASSWORD=QbTGf8aLNqbXeRCTWgkWURXk2SuXzzQM7KL
ENV NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3001/plugin_generator

# Expose the port
EXPOSE 3000

# Switch to non-root user
USER nextjs

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start the app
CMD ["npm", "start"]