FROM node:20-alpine AS base

FROM base AS builder

WORKDIR /app

COPY package.json bun.lockb ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --chown=nestjs:nodejs package.json ./

RUN npm ci --only=production && npm cache clean --force

COPY --chown=nestjs:nodejs --from=builder /app/dist ./dist
COPY --chown=nestjs:nodejs --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main.js"]
