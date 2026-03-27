# Build and run Planexa in production.
# Usage:
#   docker build -t planexa .
#   docker run --env-file .env -p 3000:3000 planexa

FROM node:22-bookworm-slim AS builder
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build && pnpm prune --prod

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
RUN groupadd -g 1001 nodejs && useradd -r -u 1001 -g nodejs nodejs
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
USER nodejs
EXPOSE 3000
CMD ["node", "dist/index.js"]
