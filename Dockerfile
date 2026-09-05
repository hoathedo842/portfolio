# =========================
# STEP 1: Base
# =========================
FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./


# =========================
# STEP 2: Development
# =========================
FROM base AS development

RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]


# =========================
# STEP 3: Build & Production Dependencies
# =========================
FROM base AS build

RUN npm ci

COPY . .

RUN npm prune --omit=dev


# =========================
# STEP 4: Production
# =========================
FROM node:22-alpine AS production

WORKDIR /app

RUN chown -R node:node /app

COPY --from=build --chown=node:node /app/package*.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/src ./src

ENV NODE_ENV=production

EXPOSE 3000

USER node

CMD ["node", "src/server.js"]