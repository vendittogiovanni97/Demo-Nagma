# Multi-stage Dockerfile for Next.js frontend (standalone output)
# Stage 1: Builder
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Runner — uses Next.js standalone output for minimal image size
FROM node:24-alpine

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Standalone build self-contains everything needed to run
COPY --from=builder --chown=nodejs:nodejs /app/.next/standalone ./
# Static assets must be placed manually alongside standalone
COPY --from=builder --chown=nodejs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nodejs:nodejs /app/public ./public

USER nodejs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# next.config.ts has output: 'standalone' — starts via server.js
CMD ["node", "server.js"]
