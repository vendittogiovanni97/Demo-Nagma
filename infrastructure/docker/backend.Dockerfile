# Demo-Nagma Backend — Multi-stage Dockerfile
# Pattern: platform-starter/infrastructure/docker/backend.Dockerfile
# Build context: root del progetto (Demo-Nagma/)

FROM node:24-alpine AS base

FROM base AS deps
WORKDIR /app
COPY backend/package*.json ./
COPY backend/prisma ./prisma
RUN npm ci --ignore-scripts

FROM deps AS builder
WORKDIR /app
COPY backend/ .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY backend/prisma ./prisma
COPY backend/package.json ./

# Infrastructure per seed + entrypoint
COPY infrastructure/database /app/infrastructure/database
COPY infrastructure/docker/docker-entrypoint.sh /app/docker-entrypoint.sh

RUN chmod +x docker-entrypoint.sh && \
    npx prisma generate

EXPOSE 3001

HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=5 \
  CMD wget -qO- http://localhost:3001/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
