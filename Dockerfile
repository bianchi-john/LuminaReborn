# --- Development: all dependencies, sources mounted as a volume (docker-compose.dev.yml)
FROM node:22-alpine AS dev
# Font for the preview watermark (Liberation Serif, metric-compatible with Times New Roman)
RUN apk add --no-cache fontconfig font-liberation
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ENV NODE_ENV=development
CMD ["npm", "run", "dev"]

# --- Build: compiles TypeScript, then keeps only the production dependencies
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

# --- Production: compiled code and runtime dependencies, non-root user
FROM node:22-alpine AS production
ENV NODE_ENV=production
# Font for the preview watermark (Liberation Serif, metric-compatible with Times New Roman)
RUN apk add --no-cache fontconfig font-liberation
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
COPY views ./views
COPY public ./public
COPY migrations ./migrations
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=120s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/healthz >/dev/null || exit 1
CMD ["node", "dist/index.js"]
