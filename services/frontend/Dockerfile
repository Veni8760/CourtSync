# syntax=docker/dockerfile:1

# --- Base image with pnpm available ---
FROM node:24-alpine AS base
RUN npm install -g pnpm@10

# --- Install dependencies (cached until lockfile changes) ---
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# --- Build the Next.js standalone output ---
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# --- Minimal runtime: just the standalone server + static assets ---
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# .next/standalone contains server.js + the trimmed node_modules it needs.
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
