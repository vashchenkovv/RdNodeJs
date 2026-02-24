# Базовый образ
FROM node:25-alpine AS base
WORKDIR /app
COPY package*.json ./

# dev
# Содержит все зависимости (в том числе devDependencies)
# Запускаме проек с hot-reload
FROM base AS dev
RUN npm ci
COPY . .
ENV NODE_ENV=development
CMD ["npm", "run", "start:dev"]

# Сборка
FROM dev AS build
RUN npm run build
RUN npm prune --production

# prod
# Минимальный образ на основе Alpine
FROM base AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
USER node
CMD ["node", "dist/src/main.js"]

#prod-distroless
FROM gcr.io/distroless/nodejs20-debian12 AS prod-distroless
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
USER node
CMD ["node", "dist/src/main.js"]