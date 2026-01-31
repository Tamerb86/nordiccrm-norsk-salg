# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production && \
    npm cache clean --force

COPY . .

RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 sparkuser

COPY --from=builder --chown=sparkuser:nodejs /app/dist ./dist
COPY --from=builder --chown=sparkuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=sparkuser:nodejs /app/package*.json ./

RUN npm install -g serve

USER sparkuser

EXPOSE 5000

CMD ["serve", "-s", "dist", "-l", "5000"]
