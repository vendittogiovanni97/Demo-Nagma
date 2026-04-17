# Multi-stage Dockerfile for Express backend with TypeScript
# Stage 1: Builder — compiles TS and generates Prisma client
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:24-alpine

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy ALL node_modules from builder (includes prisma CLI for migrations)
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy compiled output — tsconfig: rootDir:"." + outDir:"./dist" → src/index.ts → dist/src/index.js
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Prisma schema needed for migrate deploy
COPY --chown=nodejs:nodejs prisma ./prisma
COPY --chown=nodejs:nodejs package*.json ./

USER nodejs

EXPOSE 3001

# Run migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/index.js"]
