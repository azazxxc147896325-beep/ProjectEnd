# ==============================================================================
# Production Dockerfile for Campus Food Backend (NestJS + Prisma)
# ==============================================================================

# ---- Base Stage ----
FROM node:22-alpine AS base
RUN npm install -g pnpm@11
WORKDIR /app

# ---- Dependencies Stage ----
FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY apps/backend/package.json ./apps/backend/

RUN pnpm install --no-frozen-lockfile

# ---- Build Stage ----
FROM base AS build
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/packages/shared-types/node_modules ./packages/shared-types/node_modules
COPY --from=dependencies /app/apps/backend/node_modules ./apps/backend/node_modules

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared-types ./packages/shared-types
COPY apps/backend ./apps/backend

# Build shared types first
RUN pnpm --filter @campus-food/shared-types build

# Generate Prisma Client & Build NestJS backend
WORKDIR /app/apps/backend
RUN npx prisma generate
RUN pnpm build

# ---- Production Runner Stage ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

# Create non-root system user for security
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nestjs

COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=build --chown=nestjs:nodejs /app/packages/shared-types/package.json ./packages/shared-types/package.json
COPY --from=build --chown=nestjs:nodejs /app/apps/backend/dist ./apps/backend/dist
COPY --from=build --chown=nestjs:nodejs /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=build --chown=nestjs:nodejs /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=build --chown=nestjs:nodejs /app/apps/backend/package.json ./apps/backend/package.json

USER nestjs
EXPOSE 4000

WORKDIR /app/apps/backend
CMD ["node", "dist/main.js"]
