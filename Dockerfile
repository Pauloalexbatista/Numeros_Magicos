# 1. Install dependencies only when needed
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl sqlite
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# 2. Rebuild the source code only when needed
FROM node:20-alpine AS builder
# Install dependencies needed for Prisma and Build
RUN apk add --no-cache libc6-compat openssl sqlite
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1
ENV VERCEL=true
ENV DATABASE_URL="file:./prisma/dev.db"

RUN npm run build

# 3. Production image, copy all the files and run next
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000

# Install runtime dependencies (OpenSSL is required for Prisma)
RUN apk add --no-cache openssl sqlite

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public directory
COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
# NOTE: dev.db is NOT copied here because we want to mount it as a volume

USER nextjs

EXPOSE 3000

CMD ["sh", "-c", "node prisma/init-db.js && node server.js"]
